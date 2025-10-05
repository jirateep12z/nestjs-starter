import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  Matches
} from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'ชื่อ Permission',
    example: 'View Users'
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Slug สำหรับ Permission (ใช้ในระบบ)',
    example: 'users.view'
  })
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9._-]+$/, {
    message:
      'Slug must contain only lowercase letters, numbers, dots, hyphens and underscores'
  })
  slug: string;

  @ApiProperty({
    description: 'คำอธิบาย Permission',
    required: false,
    example: 'สามารถดูรายการผู้ใช้ทั้งหมด'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Resource ที่เกี่ยวข้อง',
    example: 'users'
  })
  @IsString()
  @MaxLength(50)
  resource: string;

  @ApiProperty({
    description: 'Action ที่ทำได้',
    example: 'view',
    enum: ['create', 'read', 'update', 'delete', 'manage']
  })
  @IsString()
  @MaxLength(50)
  action: string;

  @ApiProperty({
    description: 'สถานะการใช้งาน',
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
