import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIpWhitelistDto {
  @ApiPropertyOptional({
    description: 'รหัสผู้ใช้'
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({
    description: 'ที่อยู IP Address',
    example: '192.168.1.1'
  })
  @IsString()
  ip_address: string;

  @ApiPropertyOptional({ description: 'รายละเอียด' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'วันที่หมดอายุ' })
  @IsOptional()
  @IsDateString()
  expires_at?: Date;
}
