import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({ description: 'ID ของไฟล์' })
  id: string;

  @ApiProperty({ description: 'ชื่อไฟล์ต้นฉบับ' })
  original_name: string;

  @ApiProperty({ description: 'ชื่อไฟล์ที่เก็บในระบบ' })
  file_name: string;

  @ApiProperty({ description: 'URL สำหรับเข้าถึงไฟล์' })
  url: string;

  @ApiProperty({ description: 'ประเภทไฟล์ (MIME Type)' })
  mime_type: string;

  @ApiProperty({ description: 'ขนาดไฟล์ (bytes)' })
  size: number;

  @ApiProperty({ description: 'ประเภทไฟล์' })
  file_type: string;

  @ApiProperty({ description: 'คำอธิบายไฟล์' })
  description: string;

  @ApiProperty({ description: 'สถานะ public/private' })
  is_public: boolean;

  @ApiProperty({ description: 'วันที่อัพโหลด' })
  created_at: Date;
}
