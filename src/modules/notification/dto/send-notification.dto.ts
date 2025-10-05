import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsObject,
  IsOptional,
  IsEmail,
  MinLength
} from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({
    description: 'รหัส Template ที่ต้องการใช้',
    example: 'WELCOME_EMAIL'
  })
  @IsString()
  @MinLength(3)
  template_code: string;

  @ApiProperty({
    description: 'ค่าตัวแปรที่จะแทนที่ใน Template',
    example: {
      user_name: 'John Doe',
      app_name: 'My Application',
      verification_link: 'https://example.com/verify/abc123'
    }
  })
  @IsObject()
  variables: Record<string, any>;

  @ApiPropertyOptional({
    description: 'อีเมลของผู้รับ (สำหรับการส่งอีเมล)',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsOptional()
  user_email?: string;

  @ApiPropertyOptional({
    description: 'ชื่อผู้รับ',
    example: 'John Doe'
  })
  @IsString()
  @IsOptional()
  user_name?: string;

  @ApiPropertyOptional({
    description: 'ข้อมูลเพิ่มเติม',
    example: { user_id: '123', action: 'registration' }
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
