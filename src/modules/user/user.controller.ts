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
  ClassSerializerInterceptor,
  UseInterceptors,
  Query
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CheckPermissions } from '../../common/decorators/check-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CacheKey, CacheTTL } from '../../common/decorators/cache.decorator';
import { HttpCacheInterceptor } from '../../common/interceptors/cache.interceptor';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly user_service: UserService) {}

  @Post()
  @CheckPermissions('users.create')
  @ApiOperation({ summary: 'สร้างผู้ใช้ใหม่' })
  @ApiResponse({ status: 201, description: 'สร้างผู้ใช้สำเร็จ' })
  @ApiResponse({ status: 409, description: 'อีเมลนี้ถูกใช้งานแล้ว' })
  async Create(@Body() create_user_dto: CreateUserDto) {
    return await this.user_service.Create(create_user_dto);
  }

  @Get()
  @CheckPermissions('users.view')
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey('users_list')
  @CacheTTL(60)
  @ApiOperation({ summary: 'ดึงข้อมูลผู้ใช้ทั้งหมด' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  async FindAll(@Query() pagination_dto: PaginationDto) {
    return await this.user_service.FindAll(pagination_dto);
  }

  @Get(':id')
  @CheckPermissions('users.view')
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey('user_detail')
  @CacheTTL(300)
  @ApiOperation({ summary: 'ดึงข้อมูลผู้ใช้ตาม ID' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบผู้ใช้' })
  async FindOne(@Param('id') id: string) {
    return await this.user_service.FindOne(id);
  }

  @Patch(':id')
  @CheckPermissions('users.update')
  @ApiOperation({ summary: 'อัปเดตข้อมูลผู้ใช้' })
  @ApiResponse({ status: 200, description: 'อัปเดตสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบผู้ใช้' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ดำเนินการกับผู้ใช้นี้' })
  async Update(
    @Param('id') id: string,
    @Body() update_user_dto: UpdateUserDto,
    @CurrentUser('id') current_user_id: string
  ) {
    return await this.user_service.Update(id, update_user_dto, current_user_id);
  }

  @Delete(':id')
  @CheckPermissions('users.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบผู้ใช้' })
  @ApiResponse({ status: 204, description: 'ลบสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบผู้ใช้' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ดำเนินการกับผู้ใช้นี้' })
  async Remove(
    @Param('id') id: string,
    @CurrentUser('id') current_user_id: string
  ) {
    await this.user_service.Remove(id, current_user_id);
  }
}
