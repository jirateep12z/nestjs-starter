import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'อีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'อีเมลต้องไม่เป็นค่าว่าง' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'รหัสผ่านต้องไม่เป็นค่าว่าง' })
  password: string;
}
