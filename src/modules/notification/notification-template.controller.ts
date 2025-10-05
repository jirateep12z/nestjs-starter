import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationService } from './notification.service';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  SendNotificationDto
} from './dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Notification Templates')
@ApiBearerAuth()
@Controller('notification-templates')
@UseGuards(JWTAuthGuard, PermissionsGuard)
export class NotificationTemplateController {
  constructor(
    private readonly template_service: NotificationTemplateService,
    private readonly notification_service: NotificationService
  ) {}

  @Post()
  @RequirePermissions('notification_template:create')
  @ApiOperation({ summary: 'สร้าง Notification Template ใหม่' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'สร้าง Template สำเร็จ'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Template Code ซ้ำกับที่มีอยู่แล้ว'
  })
  async Create(@Body() create_dto: CreateNotificationTemplateDto) {
    return await this.template_service.Create(create_dto);
  }

  @Get()
  @RequirePermissions('notification_template:read')
  @ApiOperation({ summary: 'ดึงรายการ Notification Templates ทั้งหมด' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ดึงข้อมูล Templates สำเร็จ'
  })
  async FindAll(@Query() pagination_dto: PaginationDto) {
    return await this.template_service.FindAll(pagination_dto);
  }

  @Get('category/:category')
  @RequirePermissions('notification_template:read')
  @ApiOperation({ summary: 'ดึง Templates ตามหมวดหมู่' })
  @ApiParam({ name: 'category', description: 'หมวดหมู่ของ Template' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ดึงข้อมูล Templates ตามหมวดหมู่สำเร็จ'
  })
  async GetByCategory(@Param('category') category: string) {
    return await this.template_service.GetTemplatesByCategory(category);
  }

  @Get('code/:template_code')
  @RequirePermissions('notification_template:read')
  @ApiOperation({ summary: 'ดึง Template ตาม Template Code' })
  @ApiParam({ name: 'template_code', description: 'รหัส Template' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ดึงข้อมูล Template สำเร็จ'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ไม่พบ Template ที่ระบุ'
  })
  async FindByCode(@Param('template_code') template_code: string) {
    return await this.template_service.FindByCode(template_code);
  }

  @Get(':id')
  @RequirePermissions('notification_template:read')
  @ApiOperation({ summary: 'ดึง Template ตาม ID' })
  @ApiParam({ name: 'id', description: 'UUID ของ Template' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ดึงข้อมูล Template สำเร็จ'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ไม่พบ Template ที่ระบุ'
  })
  async FindOne(@Param('id') id: string) {
    return await this.template_service.FindOne(id);
  }

  @Put(':id')
  @RequirePermissions('notification_template:update')
  @ApiOperation({ summary: 'อัพเดท Notification Template' })
  @ApiParam({ name: 'id', description: 'UUID ของ Template' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'อัพเดท Template สำเร็จ'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ไม่พบ Template ที่ระบุ'
  })
  async Update(
    @Param('id') id: string,
    @Body() update_dto: UpdateNotificationTemplateDto
  ) {
    return await this.template_service.Update(id, update_dto);
  }

  @Patch(':id/toggle-active')
  @RequirePermissions('notification_template:update')
  @ApiOperation({ summary: 'เปลี่ยนสถานะการใช้งานของ Template' })
  @ApiParam({ name: 'id', description: 'UUID ของ Template' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'เปลี่ยนสถานะสำเร็จ'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ไม่พบ Template ที่ระบุ'
  })
  async ToggleActive(@Param('id') id: string) {
    return await this.template_service.ToggleActive(id);
  }

  @Delete(':id')
  @RequirePermissions('notification_template:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบ Notification Template' })
  @ApiParam({ name: 'id', description: 'UUID ของ Template' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'ลบ Template สำเร็จ'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ไม่พบ Template ที่ระบุ'
  })
  async Delete(@Param('id') id: string) {
    await this.template_service.Delete(id);
  }

  @Post('send')
  @RequirePermissions('notification:send')
  @ApiOperation({ summary: 'ส่ง Notification โดยใช้ Template' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ส่ง Notification สำเร็จ'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ไม่พบ Template ที่ระบุ'
  })
  async SendNotification(@Body() send_dto: SendNotificationDto) {
    return await this.notification_service.SendWithTemplate(send_dto);
  }

  @Post(':id/preview')
  @RequirePermissions('notification_template:read')
  @ApiOperation({ summary: 'ดูตัวอย่าง Template ที่ Render แล้ว' })
  @ApiParam({ name: 'id', description: 'UUID ของ Template' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Render Template สำเร็จ'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ไม่พบ Template ที่ระบุ'
  })
  async PreviewTemplate(
    @Param('id') id: string,
    @Body() variables: Record<string, any>
  ) {
    const template = await this.template_service.FindOne(id);
    return this.template_service.RenderTemplate(template, variables);
  }
}
