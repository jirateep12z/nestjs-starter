import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTemplate } from './entities/notification-template.entity';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto
} from './dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class NotificationTemplateService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private readonly template_repository: Repository<NotificationTemplate>,
    private readonly logger_service: LoggerService
  ) {
    this.logger_service.SetContext('NotificationTemplateService');
  }

  async Create(
    create_dto: CreateNotificationTemplateDto
  ): Promise<NotificationTemplate> {
    try {
      const existing_template = await this.template_repository.findOne({
        where: { template_code: create_dto.template_code }
      });
      if (existing_template) {
        throw new ConflictException({
          en: `Template with code '${create_dto.template_code}' already exists`,
          th: `มี template กับโค้ด '${create_dto.template_code}' แล้ว`
        });
      }
      const template = this.template_repository.create(create_dto);
      const saved_template = await this.template_repository.save(template);
      this.logger_service.Info('Created notification template', {
        template_code: saved_template.template_code
      });
      return saved_template;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger_service.Error('Failed to create template', error);
      throw new BadRequestException({
        en: 'Failed to create notification template',
        th: 'ไม่สามารถสร้าง template ได้'
      });
    }
  }

  async FindAll(pagination_dto?: PaginationDto): Promise<{
    data: NotificationTemplate[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = pagination_dto?.page || 1;
      const limit = pagination_dto?.limit || 10;
      const skip = (page - 1) * limit;
      const query_builder =
        this.template_repository.createQueryBuilder('template');
      if (pagination_dto?.search) {
        query_builder.where(
          'template.template_name LIKE :search OR template.template_code LIKE :search OR template.description LIKE :search',
          { search: `%${pagination_dto.search}%` }
        );
      }
      if (pagination_dto?.sort_by) {
        const order =
          pagination_dto.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        query_builder.orderBy(`template.${pagination_dto.sort_by}`, order);
      } else {
        query_builder.orderBy('template.priority', 'DESC');
        query_builder.addOrderBy('template.created_at', 'DESC');
      }
      const [data, total] = await query_builder
        .skip(skip)
        .take(limit)
        .getManyAndCount();
      return {
        data,
        total,
        page,
        limit
      };
    } catch (error) {
      this.logger_service.Error('Failed to fetch templates', error);
      throw new BadRequestException({
        en: 'Failed to fetch notification templates',
        th: 'ไม่สามารถดึง template ได้'
      });
    }
  }

  async FindOne(id: string): Promise<NotificationTemplate> {
    try {
      const template = await this.template_repository.findOne({
        where: { id }
      });
      if (!template) {
        throw new NotFoundException({
          en: `Template with ID '${id}' not found`,
          th: `ไม่พบ template ที่มี ID '${id}'`
        });
      }
      return template;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger_service.Error('Failed to fetch template', error);
      throw new BadRequestException({
        en: 'Failed to fetch notification template',
        th: 'ไม่สามารถดึง template ได้'
      });
    }
  }

  async FindByCode(template_code: string): Promise<NotificationTemplate> {
    try {
      const template = await this.template_repository.findOne({
        where: { template_code, is_active: true }
      });
      if (!template) {
        throw new NotFoundException({
          en: `Active template with code '${template_code}' not found`,
          th: `ไม่พบ template กับโค้ด '${template_code}' ที่ใช้งานอยู่`
        });
      }
      return template;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger_service.Error('Failed to fetch template by code', error);
      throw new BadRequestException({
        en: 'Failed to fetch notification template',
        th: 'ไม่สามารถดึง template ได้'
      });
    }
  }

  async Update(
    id: string,
    update_dto: UpdateNotificationTemplateDto
  ): Promise<NotificationTemplate> {
    try {
      const template = await this.FindOne(id);
      if (
        update_dto.template_code &&
        update_dto.template_code !== template.template_code
      ) {
        const existing_template = await this.template_repository.findOne({
          where: { template_code: update_dto.template_code }
        });
        if (existing_template) {
          throw new ConflictException({
            en: `Template with code '${update_dto.template_code}' already exists`,
            th: `มี template กับโค้ด '${update_dto.template_code}' แล้ว`
          });
        }
      }
      Object.assign(template, update_dto);
      const updated_template = await this.template_repository.save(template);
      this.logger_service.Info('Updated notification template', {
        template_code: template.template_code
      });
      return updated_template;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger_service.Error('Failed to update template', error);
      throw new BadRequestException({
        en: 'Failed to update notification template',
        th: 'ไม่สามารถอัปเดต template ได้'
      });
    }
  }

  async Delete(id: string): Promise<void> {
    try {
      const template = await this.FindOne(id);
      await this.template_repository.remove(template);
      this.logger_service.Info('Deleted notification template', {
        template_code: template.template_code
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger_service.Error('Failed to delete template', error);
      throw new BadRequestException({
        en: 'Failed to delete notification template',
        th: 'ไม่สามารถลบ template ได้'
      });
    }
  }

  async ToggleActive(id: string): Promise<NotificationTemplate> {
    try {
      const template = await this.FindOne(id);
      template.is_active = !template.is_active;
      const updated_template = await this.template_repository.save(template);
      this.logger_service.Info('Toggled template active status', {
        template_code: template.template_code,
        is_active: template.is_active
      });
      return updated_template;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger_service.Error('Failed to toggle template status', error);
      throw new BadRequestException({
        en: 'Failed to toggle template status',
        th: 'ไม่สามารถสลับสถานะ template ได้'
      });
    }
  }

  RenderTemplate(
    template: NotificationTemplate,
    variables: Record<string, any>
  ): { subject: string; body: string } {
    try {
      const merged_variables = {
        ...template.default_values,
        ...variables
      };
      let rendered_subject = template.subject;
      let rendered_body = template.body_template;
      for (const [key, value] of Object.entries(merged_variables)) {
        const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        rendered_subject = rendered_subject.replace(
          placeholder,
          String(value ?? '')
        );
        rendered_body = rendered_body.replace(placeholder, String(value ?? ''));
      }
      const missing_variables: string[] = [];
      const variable_pattern = /{{\\s*([^}]+)\\s*}}/g;
      let match;
      while ((match = variable_pattern.exec(rendered_body)) !== null) {
        missing_variables.push(match[1].trim());
      }
      if (missing_variables.length > 0) {
        this.logger_service.Warn('Missing variables in template', {
          template_code: template.template_code,
          missing_variables: missing_variables.join(', ')
        });
      }
      return {
        subject: rendered_subject,
        body: rendered_body
      };
    } catch (error) {
      this.logger_service.Error('Failed to render template', error);
      throw new BadRequestException({
        en: 'Failed to render notification template',
        th: 'ไม่สามารถ render template ได้'
      });
    }
  }

  async GetTemplatesByCategory(
    category: string
  ): Promise<NotificationTemplate[]> {
    try {
      return await this.template_repository.find({
        where: { category: category as any, is_active: true },
        order: { priority: 'DESC', created_at: 'DESC' }
      });
    } catch (error) {
      this.logger_service.Error('Failed to fetch templates by category', error);
      throw new BadRequestException({
        en: 'Failed to fetch templates by category',
        th: 'ไม่สามารถดึง template ได้'
      });
    }
  }
}
