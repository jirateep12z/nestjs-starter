import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RestoreBackupDto {
  @ApiProperty({
    description: 'ชื่อไฟล์ backup ที่ต้องการ restore',
    example: 'database-20251010-142119.sql.gz',
    required: true
  })
  @IsString({ message: 'backup_file ต้องเป็น string' })
  @IsNotEmpty({ message: 'backup_file ต้องไม่เป็นค่าว่าง' })
  backup_file: string;

  @ApiProperty({
    description: 'ตรวจสอบไฟล์ backup ก่อน restore หรือไม่',
    example: true,
    required: false,
    default: true
  })
  @IsBoolean({ message: 'verify_before_restore ต้องเป็น boolean' })
  @IsOptional()
  verify_before_restore?: boolean = true;

  @ApiProperty({
    description: 'สร้าง backup ปัจจุบันก่อน restore หรือไม่',
    example: true,
    required: false,
    default: true
  })
  @IsBoolean({ message: 'create_backup_before_restore ต้องเป็น boolean' })
  @IsOptional()
  create_backup_before_restore?: boolean = true;
}

export class DeleteBackupDto {
  @ApiProperty({
    description: 'ชื่อไฟล์ backup ที่ต้องการลบ',
    example: 'database-20251010-142119.sql.gz'
  })
  @IsString({ message: 'file_name ต้องเป็น string' })
  @IsNotEmpty({ message: 'file_name ต้องไม่เป็นค่าว่าง' })
  file_name: string;
}
