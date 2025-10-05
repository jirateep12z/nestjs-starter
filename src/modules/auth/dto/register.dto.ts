import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'อีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'อีเมลต้องไม่เป็นค่าว่าง' })
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  @IsNotEmpty({ message: 'รหัสผ่านต้องไม่เป็นค่าว่าง' })
  password: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsString({ message: 'ชื่อต้องเป็นข้อความ' })
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString({ message: 'นามสกุลต้องเป็นข้อความ' })
  @IsOptional()
  last_name?: string;
}
