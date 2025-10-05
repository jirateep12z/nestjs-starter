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
  Request,
  Query
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CheckPermissions } from '../../common/decorators/check-permissions.decorator';

@ApiTags('RBAC')
@ApiBearerAuth()
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbac_service: RbacService) {}

  @Post('roles')
  @CheckPermissions('roles.create')
  @ApiOperation({ summary: 'สร้าง Role ใหม่' })
  @ApiResponse({ status: 201, description: 'สร้าง Role สำเร็จ' })
  @ApiResponse({ status: 409, description: 'Role นี้มีอยู่แล้ว' })
  async CreateRole(@Body() create_role_dto: CreateRoleDto) {
    return await this.rbac_service.CreateRole(create_role_dto);
  }

  @Get('roles')
  @CheckPermissions('roles.view')
  @ApiOperation({ summary: 'ดึงรายการ Roles ทั้งหมด (รองรับ Pagination)' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  async FindAllRoles(@Query() pagination_dto: PaginationDto) {
    return await this.rbac_service.FindAllRoles(pagination_dto);
  }

  @Get('roles/:id')
  @CheckPermissions('roles.view')
  @ApiOperation({ summary: 'ดึงข้อมูล Role ตาม ID' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบ Role' })
  async FindOneRole(@Param('id') id: string) {
    return await this.rbac_service.FindOneRole(id);
  }

  @Patch('roles/:id')
  @CheckPermissions('roles.update')
  @ApiOperation({ summary: 'อัปเดตข้อมูล Role' })
  @ApiResponse({ status: 200, description: 'อัปเดตสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบ Role' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์แก้ไข Role นี้' })
  async UpdateRole(
    @Param('id') id: string,
    @Body() update_role_dto: UpdateRoleDto,
    @Request() req: any
  ) {
    const current_user_role_priority = req.user?.role_entity?.priority;
    return await this.rbac_service.UpdateRole(
      id,
      update_role_dto,
      current_user_role_priority
    );
  }

  @Delete('roles/:id')
  @CheckPermissions('roles.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบ Role' })
  @ApiResponse({ status: 204, description: 'ลบสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบ Role' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ลบ Role นี้' })
  async DeleteRole(@Param('id') id: string, @Request() req: any) {
    const current_user_role_priority = req.user?.role_entity?.priority;
    await this.rbac_service.DeleteRole(id, current_user_role_priority);
  }

  @Post('roles/:id/permissions')
  @CheckPermissions('roles.manage')
  @ApiOperation({ summary: 'กำหนด Permissions ให้กับ Role' })
  @ApiResponse({ status: 200, description: 'กำหนดสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบ Role หรือ Permission' })
  @ApiResponse({
    status: 403,
    description: 'ไม่มีสิทธิ์กำหนดสิทธิ์ให้ Role นี้'
  })
  async AssignPermissionsToRole(
    @Param('id') id: string,
    @Body() assign_permissions_dto: AssignPermissionsDto,
    @Request() req: any
  ) {
    const current_user_role_priority = req.user?.role_entity?.priority;
    return await this.rbac_service.AssignPermissionsToRole(
      id,
      assign_permissions_dto,
      current_user_role_priority
    );
  }

  @Post('permissions')
  @CheckPermissions('permissions.create')
  @ApiOperation({ summary: 'สร้าง Permission ใหม่' })
  @ApiResponse({ status: 201, description: 'สร้าง Permission สำเร็จ' })
  @ApiResponse({ status: 409, description: 'Permission นี้มีอยู่แล้ว' })
  async CreatePermission(@Body() create_permission_dto: CreatePermissionDto) {
    return await this.rbac_service.CreatePermission(create_permission_dto);
  }

  @Get('permissions')
  @CheckPermissions('permissions.view')
  @ApiOperation({ summary: 'ดึงรายการ Permissions ทั้งหมด' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  async FindAllPermissions(@Query() pagination_dto: PaginationDto) {
    return await this.rbac_service.FindAllPermissions(pagination_dto);
  }

  @Get('permissions/:id')
  @CheckPermissions('permissions.view')
  @ApiOperation({ summary: 'ดึงข้อมูล Permission ตาม ID' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบ Permission' })
  async FindOnePermission(@Param('id') id: string) {
    return await this.rbac_service.FindOnePermission(id);
  }

  @Patch('permissions/:id')
  @CheckPermissions('permissions.update')
  @ApiOperation({ summary: 'อัปเดตข้อมูล Permission' })
  @ApiResponse({ status: 200, description: 'อัปเดตสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบ Permission' })
  async UpdatePermission(
    @Param('id') id: string,
    @Body() update_permission_dto: UpdatePermissionDto
  ) {
    return await this.rbac_service.UpdatePermission(id, update_permission_dto);
  }

  @Delete('permissions/:id')
  @CheckPermissions('permissions.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบ Permission' })
  @ApiResponse({ status: 204, description: 'ลบสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบ Permission' })
  async DeletePermission(@Param('id') id: string) {
    await this.rbac_service.DeletePermission(id);
  }
}
