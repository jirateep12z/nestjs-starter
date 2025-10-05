import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { UploadService } from './upload.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { CheckPermissions } from '../../common/decorators/check-permissions.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly upload_service: UploadService) {}

  @Post('single')
  @CheckPermissions('files.upload')
  @ApiOperation({ summary: 'อัพโหลดไฟล์เดี่ยว' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'ไฟล์ที่ต้องการอัพโหลด'
        },
        description: {
          type: 'string',
          description: 'คำอธิบายไฟล์'
        },
        is_public: {
          type: 'boolean',
          description: 'กำหนดว่าไฟล์เป็น public หรือไม่',
          default: true
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'อัพโหลดไฟล์สำเร็จ',
    type: FileResponseDto
  })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' })
  async UploadSingle(
    @Req() request: FastifyRequest,
    @GetUser() user: User
  ): Promise<FileResponseDto> {
    const data = await request.file();
    if (!data) {
      throw new BadRequestException({
        en: 'File not selected',
        th: 'กรุณาเลือกไฟล์'
      });
    }
    const upload_file_dto: UploadFileDto = {
      description: (data.fields as any)?.description?.value,
      is_public: (data.fields as any)?.is_public?.value === 'true'
    };
    return await this.upload_service.UploadFile(
      data,
      upload_file_dto,
      user?.id
    );
  }

  @Post('multiple')
  @CheckPermissions('files.upload')
  @ApiOperation({ summary: 'อัพโหลดหลายไฟล์พร้อมกัน' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          },
          description: 'ไฟล์ที่ต้องการอัพโหลด (หลายไฟล์)'
        },
        description: {
          type: 'string',
          description: 'คำอธิบายไฟล์'
        },
        is_public: {
          type: 'boolean',
          description: 'กำหนดว่าไฟล์เป็น public หรือไม่',
          default: true
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'อัพโหลดไฟล์สำเร็จ',
    type: [FileResponseDto]
  })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' })
  async UploadMultiple(
    @Req() request: FastifyRequest,
    @GetUser() user: User
  ): Promise<FileResponseDto[]> {
    const parts = request.parts();
    const upload_promises: Promise<FileResponseDto>[] = [];
    const upload_file_dto: UploadFileDto = {};
    let file_count = 0;
    for await (const part of parts) {
      if (part.type === 'file') {
        file_count++;
        upload_promises.push(
          this.upload_service.UploadFile(part, upload_file_dto, user?.id)
        );
      } else {
        if (part.fieldname === 'description') {
          upload_file_dto.description = part.value as string;
        } else if (part.fieldname === 'is_public') {
          upload_file_dto.is_public = part.value === 'true';
        }
      }
    }
    if (file_count === 0) {
      throw new BadRequestException({
        en: 'No files selected',
        th: 'กรุณาเลือกไฟล์'
      });
    }
    return await Promise.all(upload_promises);
  }

  @Get('files')
  @CheckPermissions('files.view')
  @ApiOperation({ summary: 'ดึงรายการไฟล์ทั้งหมด' })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลสำเร็จ',
    type: [FileResponseDto]
  })
  async FindAll(@GetUser() user: User): Promise<FileResponseDto[]> {
    const has_manage_permission =
      user.role_entity?.permissions?.some(
        p => p.slug === 'files.manage' && p.is_active
      ) || false;
    const user_id = has_manage_permission ? undefined : user.id;
    return await this.upload_service.FindAll(user_id);
  }

  @Get('files/:id')
  @CheckPermissions('files.view')
  @ApiOperation({ summary: 'ดาวน์โหลดไฟล์' })
  @ApiResponse({ status: 200, description: 'ดาวน์โหลดสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบไฟล์' })
  async DownloadFile(
    @Param('id') id: string,
    @Res() reply: FastifyReply
  ): Promise<void> {
    const { stream, file } = await this.upload_service.GetFileStream(id);
    reply.header('Content-Type', file.mime_type);
    reply.header(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.original_name)}"`
    );
    reply.header('Content-Length', file.size.toString());
    reply.send(stream);
  }

  @Get('files/:id/info')
  @CheckPermissions('files.view')
  @ApiOperation({ summary: 'ดึงข้อมูลไฟล์ตาม ID' })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลสำเร็จ',
    type: FileResponseDto
  })
  @ApiResponse({ status: 404, description: 'ไม่พบไฟล์' })
  async FindOne(@Param('id') id: string): Promise<FileResponseDto> {
    return await this.upload_service.FindOne(id);
  }

  @Delete('files/:id')
  @CheckPermissions('files.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบไฟล์' })
  @ApiResponse({ status: 204, description: 'ลบสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบไฟล์' })
  async Remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    const has_manage_permission =
      user.role_entity?.permissions?.some(
        p => p.slug === 'files.manage' && p.is_active
      ) || false;
    const user_id = has_manage_permission ? undefined : user.id;
    await this.upload_service.Remove(id, user_id);
  }
}
