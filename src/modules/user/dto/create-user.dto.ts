import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength
} from 'class-validator';

export class CreateUserDto {
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
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'Role ID (UUID)',
    example: 'uuid-role-id'
  })
  @IsOptional()
  @IsUUID('4')
  role_id?: string;
}
