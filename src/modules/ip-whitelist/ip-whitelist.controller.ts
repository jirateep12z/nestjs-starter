import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { IpWhitelistService } from './ip-whitelist.service';
import { CreateIpWhitelistDto } from './dto/create-ip-whitelist.dto';
import { UpdateIpWhitelistDto } from './dto/update-ip-whitelist.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CheckPermissions } from '../../common/decorators/check-permissions.decorator';

@ApiTags('IP Whitelist')
@ApiBearerAuth()
@Controller('ip-whitelist')
export class IpWhitelistController {
  constructor(private readonly ip_whitelist_service: IpWhitelistService) {}

  @Post()
  @CheckPermissions('users.manage')
  @ApiOperation({ summary: 'เพิ่ม IP Whitelist' })
  @ApiResponse({ status: 201, description: 'เพิ่มสำเร็จ' })
  async Create(@Body() create_ip_whitelist_dto: CreateIpWhitelistDto) {
    return await this.ip_whitelist_service.Create(create_ip_whitelist_dto);
  }

  @Get()
  @CheckPermissions('users.view')
  @ApiOperation({ summary: 'ดึงรายการ IP Whitelist ทั้งหมด' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  async FindAll(@Query() pagination_dto: PaginationDto) {
    return await this.ip_whitelist_service.FindAll(pagination_dto);
  }

  @Get('user/:user_id')
  @CheckPermissions('users.view')
  @ApiOperation({ summary: 'ดึงรายการ IP Whitelist ของผู้ใช้' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  async FindByUserId(@Param('user_id') user_id: string) {
    return await this.ip_whitelist_service.FindByUserId(user_id);
  }

  @Get(':id')
  @CheckPermissions('users.view')
  @ApiOperation({ summary: 'ดึงข้อมูล IP Whitelist ตาม ID' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูล' })
  async FindOne(@Param('id') id: string) {
    return await this.ip_whitelist_service.FindOne(id);
  }

  @Patch(':id')
  @CheckPermissions('users.manage')
  @ApiOperation({ summary: 'อัปเดต IP Whitelist' })
  @ApiResponse({ status: 200, description: 'อัปเดตสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูล' })
  async Update(
    @Param('id') id: string,
    @Body() update_ip_whitelist_dto: UpdateIpWhitelistDto
  ) {
    return await this.ip_whitelist_service.Update(id, update_ip_whitelist_dto);
  }

  @Delete(':id')
  @CheckPermissions('users.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบ IP Whitelist' })
  @ApiResponse({ status: 204, description: 'ลบสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูล' })
  async Remove(@Param('id') id: string) {
    await this.ip_whitelist_service.Remove(id);
  }
}
