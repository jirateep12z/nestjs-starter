import { PartialType } from '@nestjs/swagger';
import { CreateIpWhitelistDto } from './create-ip-whitelist.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIpWhitelistDto extends PartialType(CreateIpWhitelistDto) {
  @ApiPropertyOptional({ description: 'สถานะ' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
