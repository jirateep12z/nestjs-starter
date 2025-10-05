import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RbacService } from '../../modules/rbac/rbac.service';

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
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.role_id) {
      return false;
    }
    const role = await this.rbac_service.FindOneRole(user.role_id);
    if (!role || !role.is_active) {
      return false;
    }
    const user_permission_slugs = role.permissions
      .filter(p => p.is_active)
      .map(p => p.slug);
    return required_permissions.some(permission =>
      user_permission_slugs.includes(permission)
    );
  }
}
