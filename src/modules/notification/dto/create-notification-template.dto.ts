import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsBoolean,
  IsOptional,
  IsObject,
  IsInt,
  MinLength,
  MaxLength,
  Min,
  Max
} from 'class-validator';
import {
  NotificationChannel,
  TemplateCategory
} from '../entities/notification-template.entity';

export class CreateNotificationTemplateDto {
  @ApiProperty({
    description: 'รหัสเฉพาะของ Template (ใช้ในการเรียกใช้งาน)',
    example: 'WELCOME_EMAIL'
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  template_code: string;

  @ApiProperty({
    description: 'ชื่อของ Template',
    example: 'Welcome Email Template'
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  template_name: string;

  @ApiPropertyOptional({
    description: 'คำอธิบายของ Template',
    example: 'Template สำหรับส่งอีเมลต้อนรับผู้ใช้ใหม่'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'หมวดหมู่ของ Template',
    enum: TemplateCategory,
    example: TemplateCategory.USER
  })
  @IsEnum(TemplateCategory)
  category: TemplateCategory;

  @ApiProperty({
    description: 'ช่องทางการส่ง Notification',
    enum: NotificationChannel,
    isArray: true,
    example: [NotificationChannel.EMAIL, NotificationChannel.TELEGRAM]
  })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiProperty({
    description: 'หัวข้อของ Notification (รองรับ Template Variables)',
    example: 'Welcome to {{app_name}}, {{user_name}}!'
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subject: string;

  @ApiProperty({
    description: 'เนื้อหาของ Notification (รองรับ Template Variables)',
    example:
      'Hello {{user_name}},\n\nWelcome to {{app_name}}! Your account has been successfully created.\n\nBest regards,\n{{app_name}} Team'
  })
  @IsString()
  @MinLength(1)
  body_template: string;

  @ApiPropertyOptional({
    description: 'รายการตัวแปรที่ใช้ใน Template',
    example: ['user_name', 'app_name', 'verification_link'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @ApiPropertyOptional({
    description: 'ค่าเริ่มต้นของตัวแปร',
    example: { app_name: 'My Application' }
  })
  @IsObject()
  @IsOptional()
  default_values?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ข้อมูลเพิ่มเติม (Metadata)',
    example: { tags: ['welcome', 'onboarding'], version: '1.0' }
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'สถานะการใช้งานของ Template',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'ลำดับความสำคัญ (ค่าสูงกว่า = สำคัญกว่า)',
    example: 0,
    default: 0
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  priority?: number;
}
