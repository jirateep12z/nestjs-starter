import { applyDecorators, UseGuards } from '@nestjs/common';
import { RequirePermissions } from './permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';
import { JWTAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

export function CheckPermissions(...permissions: string[]) {
  return applyDecorators(
    UseGuards(JWTAuthGuard, PermissionsGuard),
    RequirePermissions(...permissions)
  );
}
