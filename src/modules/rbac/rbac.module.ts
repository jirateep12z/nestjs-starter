import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { PermissionsGuard } from './guards/permissions.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RbacController],
  providers: [RbacService, PermissionsGuard],
  exports: [RbacService, PermissionsGuard]
})
export class RbacModule {}
