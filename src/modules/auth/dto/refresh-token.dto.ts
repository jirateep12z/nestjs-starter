import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString({ message: 'Refresh token ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'Refresh token ต้องไม่เป็นค่าว่าง' })
  refresh_token: string;
}
