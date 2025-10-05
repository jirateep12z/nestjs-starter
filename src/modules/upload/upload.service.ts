import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { File } from './entities/file.entity';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { randomBytes } from 'crypto';
import { LoggerService } from '../../common/logger/logger.service';

const pump = promisify(pipeline);

@Injectable()
export class UploadService {
  private readonly upload_dir: string;
  private readonly max_file_size: number;
  private readonly allowed_mime_types: string[];

  constructor(
    @InjectRepository(File)
    private readonly file_repository: Repository<File>,
    private readonly config_service: ConfigService,
    private readonly logger_service: LoggerService
  ) {
    this.logger_service.SetContext('UploadService');
    this.upload_dir =
      this.config_service.get<string>('upload.upload_dir') || './uploads';
    this.max_file_size =
      this.config_service.get<number>('upload.max_file_size') ||
      10 * 1024 * 1024;
    this.allowed_mime_types =
      this.config_service.get<string[]>('upload.allowed_mime_types') || [];
    this.EnsureUploadDirExists();
  }

  private EnsureUploadDirExists(): void {
    if (!fs.existsSync(this.upload_dir)) {
      fs.mkdirSync(this.upload_dir, { recursive: true });
      this.logger_service.Info('Created upload directory', {
        path: this.upload_dir
      });
    }
  }

  private GetFileType(mime_type: string): string {
    if (mime_type.startsWith('image/')) return 'image';
    if (mime_type.startsWith('video/')) return 'video';
    if (mime_type.startsWith('audio/')) return 'audio';
    if (
      mime_type.includes('pdf') ||
      mime_type.includes('document') ||
      mime_type.includes('text') ||
      mime_type.includes('spreadsheet') ||
      mime_type.includes('presentation')
    ) {
      return 'document';
    }
    return 'other';
  }

  private GenerateFileName(original_name: string): string {
    const ext = path.extname(original_name);
    const random_name = randomBytes(16).toString('hex');
    return `${Date.now()}-${random_name}${ext}`;
  }

  async UploadFile(
    file: any,
    upload_file_dto: UploadFileDto,
    user_id?: string
  ): Promise<FileResponseDto> {
    try {
      if (file.file.bytesRead > this.max_file_size) {
        throw new BadRequestException({
          en: `File size exceeds maximum allowed size of ${this.max_file_size / 1024 / 1024}MB`,
          th: `ขนาดไฟล์เกินกำหนด (สูงสุด ${this.max_file_size / 1024 / 1024}MB)`
        });
      }
      if (
        this.allowed_mime_types.length > 0 &&
        !this.allowed_mime_types.includes(file.mimetype)
      ) {
        throw new BadRequestException({
          en: `File type not allowed (${file.mimetype})`,
          th: `ประเภทไฟล์ไม่ได้รับอนุญาต (${file.mimetype})`
        });
      }
      const file_name = this.GenerateFileName(file.filename);
      const file_path = path.join(this.upload_dir, file_name);
      await pump(file.file, fs.createWriteStream(file_path));
      const file_entity = this.file_repository.create({
        original_name: file.filename,
        file_name: file_name,
        file_path: file_path,
        mime_type: file.mimetype,
        size: file.file.bytesRead,
        file_type: this.GetFileType(file.mimetype),
        description: upload_file_dto.description,
        is_public: upload_file_dto.is_public ?? true,
        uploaded_by: user_id
      });
      const saved_file = await this.file_repository.save(file_entity);
      return this.MapToResponseDto(saved_file);
    } catch (error) {
      this.logger_service.Error('Upload failed', error);
      throw new InternalServerErrorException({
        en: 'Upload failed',
        th: 'การอัพโหลดไฟล์ล้มเหลว'
      });
    }
  }

  async UploadMultipleFiles(
    files: any[],
    upload_file_dto: UploadFileDto,
    user_id?: string
  ): Promise<FileResponseDto[]> {
    const upload_promises = files.map(file =>
      this.UploadFile(file, upload_file_dto, user_id)
    );
    return await Promise.all(upload_promises);
  }

  async FindAll(user_id?: string): Promise<FileResponseDto[]> {
    const query = this.file_repository.createQueryBuilder('file');
    if (user_id) {
      query.where('file.uploaded_by = :user_id', { user_id });
    }
    const files = await query.orderBy('file.created_at', 'DESC').getMany();
    return files.map(file => this.MapToResponseDto(file));
  }

  async FindOne(id: string): Promise<FileResponseDto> {
    const file = await this.file_repository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException({
        en: 'File not found',
        th: 'ไม่พบไฟล์'
      });
    }
    return this.MapToResponseDto(file);
  }

  async Remove(id: string, user_id?: string): Promise<void> {
    const file = await this.file_repository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException({
        en: 'File not found',
        th: 'ไม่พบไฟล์'
      });
    }
    if (user_id && file.uploaded_by !== user_id) {
      throw new BadRequestException({
        en: 'You do not have permission to delete this file',
        th: 'คุณไม่มีสิทธิ์ลบไฟล์นี้'
      });
    }
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }
    await this.file_repository.remove(file);
  }

  async GetFileStream(
    id: string
  ): Promise<{ stream: fs.ReadStream; file: File }> {
    const file = await this.file_repository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException({
        en: 'File not found',
        th: 'ไม่พบไฟล์'
      });
    }
    if (!fs.existsSync(file.file_path)) {
      throw new NotFoundException({
        en: 'File not found',
        th: 'ไฟล์ไม่อยู่ในระบบ'
      });
    }
    const stream = fs.createReadStream(file.file_path);
    return { stream, file };
  }

  private MapToResponseDto(file: File): FileResponseDto {
    const base_url =
      this.config_service.get<string>('app.base_url') ||
      'http://localhost:3000';
    const api_prefix =
      this.config_service.get<string>('app.api_prefix') || 'api/v1';
    return {
      id: file.id,
      original_name: file.original_name,
      file_name: file.file_name,
      url: `${base_url}/${api_prefix}/upload/files/${file.id}`,
      mime_type: file.mime_type,
      size: file.size,
      file_type: file.file_type,
      description: file.description,
      is_public: file.is_public,
      created_at: file.created_at
    };
  }
}
