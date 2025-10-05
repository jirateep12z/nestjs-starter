import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsInt,
  Min,
  MaxLength,
  Matches
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'ชื่อ Role',
    example: 'Manager'
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Slug สำหรับ Role (ใช้ในระบบ)',
    example: 'manager'
  })
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9_-]+$/, {
    message:
      'Slug must contain only lowercase letters, numbers, hyphens and underscores'
  })
  slug: string;

  @ApiProperty({
    description: 'คำอธิบาย Role',
    required: false,
    example: 'ผู้จัดการที่สามารถจัดการทีมและโปรเจค'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'ลำดับความสำคัญ (ยิ่งสูงยิ่งมีสิทธิ์มาก)',
    required: false,
    default: 0,
    example: 50
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiProperty({
    description: 'รายการ Permission IDs',
    required: false,
    type: [String],
    example: ['uuid-1', 'uuid-2']
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permission_ids?: string[];

  @ApiProperty({
    description: 'สถานะการใช้งาน',
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
