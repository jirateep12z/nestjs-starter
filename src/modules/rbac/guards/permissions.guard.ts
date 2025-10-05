import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { RbacService } from '../rbac.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbac_service: RbacService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required_permissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!required_permissions || required_permissions.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role_entity) {
      return false;
    }
    const user_role_slug = user.role_entity.slug;
    for (const permission of required_permissions) {
      const has_permission = await this.rbac_service.CheckPermission(
        user_role_slug,
        permission
      );
      if (!has_permission) {
        return false;
      }
    }
    return true;
  }
}
