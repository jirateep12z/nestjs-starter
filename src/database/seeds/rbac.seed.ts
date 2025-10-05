import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role } from '../../modules/rbac/entities/role.entity';
import { Permission } from '../../modules/rbac/entities/permission.entity';

const logger = new Logger('RbacSeeder');

export async function SeedRbac(data_source: DataSource): Promise<void> {
  const role_repository = data_source.getRepository(Role);
  const permission_repository = data_source.getRepository(Permission);
  const permissions_data = [
    // User Management
    {
      name: 'View Users',
      slug: 'users.view',
      description: 'สามารถดูรายการผู้ใช้',
      resource: 'users',
      action: 'read'
    },
    {
      name: 'Create Users',
      slug: 'users.create',
      description: 'สามารถสร้างผู้ใช้ใหม่',
      resource: 'users',
      action: 'create'
    },
    {
      name: 'Update Users',
      slug: 'users.update',
      description: 'สามารถแก้ไขข้อมูลผู้ใช้',
      resource: 'users',
      action: 'update'
    },
    {
      name: 'Delete Users',
      slug: 'users.delete',
      description: 'สามารถลบผู้ใช้',
      resource: 'users',
      action: 'delete'
    },
    {
      name: 'Manage Users',
      slug: 'users.manage',
      description: 'สามารถจัดการผู้ใช้ทั้งหมด',
      resource: 'users',
      action: 'manage'
    },
    // RBAC Management
    {
      name: 'View Roles',
      slug: 'roles.view',
      description: 'สามารถดูรายการ Roles',
      resource: 'roles',
      action: 'read'
    },
    {
      name: 'Create Roles',
      slug: 'roles.create',
      description: 'สามารถสร้าง Role ใหม่',
      resource: 'roles',
      action: 'create'
    },
    {
      name: 'Update Roles',
      slug: 'roles.update',
      description: 'สามารถแก้ไข Role',
      resource: 'roles',
      action: 'update'
    },
    {
      name: 'Delete Roles',
      slug: 'roles.delete',
      description: 'สามารถลบ Role',
      resource: 'roles',
      action: 'delete'
    },
    {
      name: 'Manage Roles',
      slug: 'roles.manage',
      description: 'สามารถจัดการ Roles ทั้งหมด',
      resource: 'roles',
      action: 'manage'
    },
    // Permission Management
    {
      name: 'View Permissions',
      slug: 'permissions.view',
      description: 'สามารถดูรายการ Permissions',
      resource: 'permissions',
      action: 'read'
    },
    {
      name: 'Create Permissions',
      slug: 'permissions.create',
      description: 'สามารถสร้าง Permission ใหม่',
      resource: 'permissions',
      action: 'create'
    },
    {
      name: 'Update Permissions',
      slug: 'permissions.update',
      description: 'สามารถแก้ไข Permission',
      resource: 'permissions',
      action: 'update'
    },
    {
      name: 'Delete Permissions',
      slug: 'permissions.delete',
      description: 'สามารถลบ Permission',
      resource: 'permissions',
      action: 'delete'
    },
    {
      name: 'Manage Permissions',
      slug: 'permissions.manage',
      description: 'สามารถจัดการ Permissions ทั้งหมด',
      resource: 'permissions',
      action: 'manage'
    },
    // File Upload
    {
      name: 'Upload Files',
      slug: 'files.upload',
      description: 'สามารถอัพโหลดไฟล์',
      resource: 'files',
      action: 'create'
    },
    {
      name: 'View Files',
      slug: 'files.view',
      description: 'สามารถดูไฟล์',
      resource: 'files',
      action: 'read'
    },
    {
      name: 'Delete Files',
      slug: 'files.delete',
      description: 'สามารถลบไฟล์',
      resource: 'files',
      action: 'delete'
    },
    {
      name: 'Manage Files',
      slug: 'files.manage',
      description: 'สามารถจัดการไฟล์ทั้งหมด',
      resource: 'files',
      action: 'manage'
    },
    // Notification Template Management
    {
      name: 'View Notification Templates',
      slug: 'notification_template:read',
      description: 'สามารถดูรายการ Notification Templates',
      resource: 'notification_template',
      action: 'read'
    },
    {
      name: 'Create Notification Templates',
      slug: 'notification_template:create',
      description: 'สามารถสร้าง Notification Template ใหม่',
      resource: 'notification_template',
      action: 'create'
    },
    {
      name: 'Update Notification Templates',
      slug: 'notification_template:update',
      description: 'สามารถแก้ไข Notification Template',
      resource: 'notification_template',
      action: 'update'
    },
    {
      name: 'Delete Notification Templates',
      slug: 'notification_template:delete',
      description: 'สามารถลบ Notification Template',
      resource: 'notification_template',
      action: 'delete'
    },
    {
      name: 'Send Notifications',
      slug: 'notification:send',
      description: 'สามารถส่ง Notification',
      resource: 'notification',
      action: 'create'
    },
    // Backup Management
    {
      name: 'View Backups',
      slug: 'backup:view',
      resource: 'backup',
      action: 'view',
      description: 'ดูรายการ backup'
    },
    {
      name: 'Manage Backups',
      slug: 'backup:manage',
      resource: 'backup',
      action: 'manage',
      description: 'จัดการระบบ backup (สร้าง, ลบ, restore)'
    },
    // System Management
    {
      name: 'View System Health',
      slug: 'system:health',
      resource: 'system',
      action: 'health',
      description: 'ดูสถานะสุขภาพของระบบ'
    },
    {
      name: 'Manage System Settings',
      slug: 'system:settings',
      resource: 'system',
      action: 'settings',
      description: 'จัดการการตั้งค่าระบบ'
    }
  ];
  const permissions: Permission[] = [];
  for (const perm_data of permissions_data) {
    let permission = await permission_repository.findOne({
      where: { slug: perm_data.slug }
    });

    if (!permission) {
      permission = permission_repository.create(perm_data);
      await permission_repository.save(permission);
    }

    permissions.push(permission);
  }
  const roles_data = [
    {
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'ผู้ดูแลระบบสูงสุด',
      priority: 100,
      is_system: true,
      permission_slugs: [
        'users.view',
        'users.create',
        'users.update',
        'users.delete',
        'users.manage',
        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',
        'roles.manage',
        'permissions.view',
        'permissions.create',
        'permissions.update',
        'permissions.delete',
        'permissions.manage',
        'files.upload',
        'files.view',
        'files.delete',
        'files.manage',
        'notification_template:read',
        'notification_template:create',
        'notification_template:update',
        'notification_template:delete',
        'notification:send',
        'backup:view',
        'backup:manage',
        'system:health',
        'system:settings'
      ]
    },
    {
      name: 'Admin',
      slug: 'admin',
      description: 'ผู้ดูแลระบบ',
      priority: 80,
      is_system: true,
      permission_slugs: [
        'users.view',
        'users.create',
        'users.update',
        'users.delete',
        'users.manage',
        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',
        'roles.manage',
        'permissions.view',
        'permissions.create',
        'permissions.update',
        'permissions.delete',
        'permissions.manage',
        'files.upload',
        'files.view',
        'files.delete',
        'files.manage',
        'notification_template:read',
        'notification_template:create',
        'notification_template:update',
        'notification_template:delete',
        'notification:send',
        'backup:view',
        'backup:manage',
        'system:health',
        'system:settings'
      ]
    },
    {
      name: 'User',
      slug: 'user',
      description: 'ผู้ใช้ทั่วไป',
      priority: 50,
      is_system: true,
      permission_slugs: [
        'users.view',
        'users.create',
        'users.update',
        'users.delete',
        'files.upload',
        'files.view',
        'files.delete',
        'notification:send'
      ]
    },
    {
      name: 'Guest',
      slug: 'guest',
      description: 'ผู้เยี่ยมชม',
      priority: 10,
      is_system: true,
      permission_slugs: []
    }
  ];
  for (const role_data of roles_data) {
    let role = await role_repository.findOne({
      where: { slug: role_data.slug },
      relations: ['permissions']
    });
    const role_permissions = permissions.filter(p =>
      role_data.permission_slugs.includes(p.slug)
    );
    if (!role) {
      role = role_repository.create({
        name: role_data.name,
        slug: role_data.slug,
        description: role_data.description,
        priority: role_data.priority,
        is_system: role_data.is_system,
        permissions: role_permissions
      });
      await role_repository.save(role);
      logger.log(`✅ Created role: ${role_data.name}`);
    } else {
      role.permissions = role_permissions;
      await role_repository.save(role);
      logger.log(`♻️  Updated role: ${role_data.name}`);
    }
  }
  logger.log('✅ RBAC Seed completed!');
}
