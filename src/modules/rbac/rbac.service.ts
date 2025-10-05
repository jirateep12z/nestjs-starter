import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import {
  PaginationDto,
  PaginatedResult,
  PaginationHelper
} from '../../common/dto/pagination.dto';
import { QueryBuilderUtil } from '../../common/utils/query-builder.util';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private readonly role_repository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permission_repository: Repository<Permission>
  ) {}

  async CreateRole(create_role_dto: CreateRoleDto): Promise<Role> {
    const existing_role = await this.role_repository.findOne({
      where: [{ name: create_role_dto.name }, { slug: create_role_dto.slug }]
    });
    if (existing_role) {
      throw new ConflictException({
        en: 'Role name or slug already exists',
        th: 'ชื่อหรือ slug ของ Role นี้มีอยู่แล้ว'
      });
    }
    let permissions: Permission[] = [];
    if (
      create_role_dto.permission_ids &&
      create_role_dto.permission_ids.length > 0
    ) {
      permissions = await this.permission_repository.findBy({
        id: In(create_role_dto.permission_ids)
      });
      if (permissions.length !== create_role_dto.permission_ids.length) {
        throw new BadRequestException({
          en: 'Some permissions not found',
          th: 'ไม่พบ Permission บางรายการ'
        });
      }
    }
    const role = this.role_repository.create({
      ...create_role_dto,
      permissions
    });
    return await this.role_repository.save(role);
  }

  async FindAllRoles(
    pagination_dto?: PaginationDto
  ): Promise<PaginatedResult<Role>> {
    const query_builder = this.role_repository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions');
    if (pagination_dto) {
      QueryBuilderUtil.ApplyAll(query_builder, pagination_dto, 'role', {
        search_fields: ['name', 'slug', 'description'],
        default_sort_field: 'priority'
      });
    } else {
      query_builder.orderBy('role.priority', 'DESC');
    }
    const [items, total] = await query_builder.getManyAndCount();
    if (pagination_dto) {
      return PaginationHelper.CreateResult(
        items,
        pagination_dto.page || 1,
        pagination_dto.limit || 10,
        total
      );
    }
    return PaginationHelper.CreateResult(items, 1, items.length, total);
  }

  async FindOneRole(id: string): Promise<Role> {
    const role = await this.role_repository.findOne({
      where: { id },
      relations: ['permissions', 'users']
    });
    if (!role) {
      throw new NotFoundException({
        en: 'Role not found',
        th: 'ไม่พบ Role'
      });
    }
    return role;
  }

  async FindRoleBySlug(slug: string): Promise<Role> {
    const role = await this.role_repository.findOne({
      where: { slug },
      relations: ['permissions']
    });
    if (!role) {
      throw new NotFoundException({
        en: 'Role not found',
        th: 'ไม่พบ Role'
      });
    }
    return role;
  }

  async UpdateRole(
    id: string,
    update_role_dto: UpdateRoleDto,
    current_user_role_priority?: number
  ): Promise<Role> {
    const role = await this.FindOneRole(id);
    if (role.is_system) {
      throw new BadRequestException({
        en: 'Cannot modify system role',
        th: 'ไม่สามารถแก้ไข Role ของระบบได้'
      });
    }
    if (
      current_user_role_priority !== undefined &&
      role.priority > current_user_role_priority
    ) {
      throw new ForbiddenException({
        en: 'You cannot modify roles with higher priority',
        th: 'คุณไม่สามารถแก้ไข Role ที่มีระดับสูงกว่าได้'
      });
    }
    if (update_role_dto.name || update_role_dto.slug) {
      const existing_role = await this.role_repository.findOne({
        where: [{ name: update_role_dto.name }, { slug: update_role_dto.slug }]
      });
      if (existing_role && existing_role.id !== id) {
        throw new ConflictException({
          en: 'Role name or slug already exists',
          th: 'ชื่อหรือ slug ของ Role นี้มีอยู่แล้ว'
        });
      }
    }
    if (update_role_dto.permission_ids) {
      const permissions = await this.permission_repository.findBy({
        id: In(update_role_dto.permission_ids)
      });
      if (permissions.length !== update_role_dto.permission_ids.length) {
        throw new BadRequestException({
          en: 'Some permissions not found',
          th: 'ไม่พบ Permission บางรายการ'
        });
      }
      role.permissions = permissions;
    }
    Object.assign(role, update_role_dto);
    return await this.role_repository.save(role);
  }

  async DeleteRole(
    id: string,
    current_user_role_priority?: number
  ): Promise<void> {
    const role = await this.FindOneRole(id);
    if (role.is_system) {
      throw new BadRequestException({
        en: 'Cannot delete system role',
        th: 'ไม่สามารถลบ Role ของระบบได้'
      });
    }
    if (
      current_user_role_priority !== undefined &&
      role.priority > current_user_role_priority
    ) {
      throw new ForbiddenException({
        en: 'You cannot delete roles with higher priority',
        th: 'คุณไม่สามารถลบ Role ที่มีระดับสูงกว่าได้'
      });
    }
    if (role.users && role.users.length > 0) {
      throw new BadRequestException({
        en: 'Cannot delete role that has users assigned',
        th: 'ไม่สามารถลบ Role ที่มีผู้ใช้อยู่ได้'
      });
    }
    await this.role_repository.remove(role);
  }

  async AssignPermissionsToRole(
    role_id: string,
    assign_permissions_dto: AssignPermissionsDto,
    current_user_role_priority?: number
  ): Promise<Role> {
    const role = await this.FindOneRole(role_id);
    if (
      current_user_role_priority !== undefined &&
      role.priority > current_user_role_priority
    ) {
      throw new ForbiddenException({
        en: 'You cannot assign permissions to roles with higher priority',
        th: 'คุณไม่สามารถกำหนดสิทธิ์ให้ Role ที่มีระดับสูงกว่าได้'
      });
    }
    const permissions = await this.permission_repository.findBy({
      id: In(assign_permissions_dto.permission_ids)
    });
    if (permissions.length !== assign_permissions_dto.permission_ids.length) {
      throw new BadRequestException({
        en: 'Some permissions not found',
        th: 'ไม่พบ Permission บางรายการ'
      });
    }
    role.permissions = permissions;
    return await this.role_repository.save(role);
  }

  async CreatePermission(
    create_permission_dto: CreatePermissionDto
  ): Promise<Permission> {
    const existing_permission = await this.permission_repository.findOne({
      where: [
        { name: create_permission_dto.name },
        { slug: create_permission_dto.slug }
      ]
    });
    if (existing_permission) {
      throw new ConflictException({
        en: 'Permission name or slug already exists',
        th: 'ชื่อหรือ slug ของ Permission นี้มีอยู่แล้ว'
      });
    }
    const permission = this.permission_repository.create(create_permission_dto);
    return await this.permission_repository.save(permission);
  }

  async FindAllPermissions(
    pagination_dto?: PaginationDto
  ): Promise<PaginatedResult<Permission>> {
    const query_builder =
      this.permission_repository.createQueryBuilder('permission');

    if (pagination_dto) {
      QueryBuilderUtil.ApplyAll(query_builder, pagination_dto, 'permission', {
        search_fields: ['name', 'slug', 'resource', 'action', 'description'],
        default_sort_field: 'resource'
      });
    } else {
      query_builder
        .orderBy('permission.resource', 'ASC')
        .addOrderBy('permission.action', 'ASC');
    }

    const [items, total] = await query_builder.getManyAndCount();

    if (pagination_dto) {
      return PaginationHelper.CreateResult(
        items,
        pagination_dto.page || 1,
        pagination_dto.limit || 10,
        total
      );
    }

    return PaginationHelper.CreateResult(items, 1, items.length, total);
  }

  async FindOnePermission(id: string): Promise<Permission> {
    const permission = await this.permission_repository.findOne({
      where: { id },
      relations: ['roles']
    });
    if (!permission) {
      throw new NotFoundException({
        en: 'Permission not found',
        th: 'ไม่พบ Permission'
      });
    }
    return permission;
  }

  async UpdatePermission(
    id: string,
    update_permission_dto: UpdatePermissionDto
  ): Promise<Permission> {
    const permission = await this.FindOnePermission(id);
    if (update_permission_dto.name || update_permission_dto.slug) {
      const existing_permission = await this.permission_repository.findOne({
        where: [
          { name: update_permission_dto.name },
          { slug: update_permission_dto.slug }
        ]
      });
      if (existing_permission && existing_permission.id !== id) {
        throw new ConflictException({
          en: 'Permission name or slug already exists',
          th: 'ชื่อหรือ slug ของ Permission นี้มีอยู่แล้ว'
        });
      }
    }
    Object.assign(permission, update_permission_dto);
    return await this.permission_repository.save(permission);
  }

  async DeletePermission(id: string): Promise<void> {
    const permission = await this.FindOnePermission(id);
    if (permission.roles && permission.roles.length > 0) {
      throw new BadRequestException({
        en: 'Cannot delete permission that is assigned to roles',
        th: 'ไม่สามารถลบ Permission ที่ถูกกำหนดให้ Role ได้'
      });
    }
    await this.permission_repository.remove(permission);
  }

  async CheckPermission(
    user_role_slug: string,
    permission_slug: string
  ): Promise<boolean> {
    const role = await this.role_repository.findOne({
      where: { slug: user_role_slug, is_active: true },
      relations: ['permissions']
    });
    if (!role) {
      return false;
    }
    return role.permissions.some(
      permission => permission.slug === permission_slug && permission.is_active
    );
  }

  async GetUserPermissions(user_role_slug: string): Promise<string[]> {
    const role = await this.role_repository.findOne({
      where: { slug: user_role_slug, is_active: true },
      relations: ['permissions']
    });
    if (!role) {
      return [];
    }
    return role.permissions
      .filter(permission => permission.is_active)
      .map(permission => permission.slug);
  }
}
