import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    description: 'คำอธิบายไฟล์',
    required: false,
    example: 'รูปภาพโปรไฟล์ผู้ใช้'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'กำหนดว่าไฟล์เป็น public หรือไม่',
    required: false,
    default: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}
