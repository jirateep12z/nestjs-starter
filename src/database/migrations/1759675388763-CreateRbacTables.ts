import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey
} from 'typeorm';

export class CreateRbacTables1759675388763 implements MigrationInterface {
  public async up(query_runner: QueryRunner): Promise<void> {
    await query_runner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isUnique: true
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true
          },
          {
            name: 'is_system',
            type: 'boolean',
            default: false
          },
          {
            name: 'priority',
            type: 'int',
            default: 0
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP'
          }
        ]
      }),
      true
    );
    await query_runner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isUnique: true
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'resource',
            type: 'varchar',
            length: '50'
          },
          {
            name: 'action',
            type: 'varchar',
            length: '50'
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP'
          }
        ]
      }),
      true
    );
    await query_runner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'role_id',
            type: 'varchar',
            length: '36'
          },
          {
            name: 'permission_id',
            type: 'varchar',
            length: '36'
          }
        ]
      }),
      true
    );
    await query_runner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        name: 'FK_ROLE_PERMISSIONS_ROLE_ID',
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE'
      })
    );
    await query_runner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        name: 'FK_ROLE_PERMISSIONS_PERMISSION_ID',
        columnNames: ['permission_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permissions',
        onDelete: 'CASCADE'
      })
    );
    await query_runner.query(
      'CREATE INDEX `IDX_ROLES_SLUG` ON `roles` (`slug`)'
    );
    await query_runner.query(
      'CREATE INDEX `IDX_ROLES_PRIORITY` ON `roles` (`priority`)'
    );
    await query_runner.query(
      'CREATE INDEX `IDX_PERMISSIONS_SLUG` ON `permissions` (`slug`)'
    );
    await query_runner.query(
      'CREATE INDEX `IDX_PERMISSIONS_RESOURCE` ON `permissions` (`resource`)'
    );
    await query_runner.query(
      'CREATE INDEX `IDX_ROLE_PERMISSIONS_ROLE` ON `role_permissions` (`role_id`)'
    );
    await query_runner.query(
      'CREATE INDEX `IDX_ROLE_PERMISSIONS_PERMISSION` ON `role_permissions` (`permission_id`)'
    );
    await query_runner.query(
      'ALTER TABLE `users` ADD COLUMN `role_id` VARCHAR(36) NULL AFTER `id`'
    );
    await query_runner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'FK_USERS_ROLE_ID',
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'SET NULL'
      })
    );
    await query_runner.query(
      'CREATE INDEX `IDX_USERS_ROLE_ID` ON `users` (`role_id`)'
    );
  }

  public async down(query_runner: QueryRunner): Promise<void> {
    const users_table = await query_runner.getTable('users');
    if (users_table) {
      const user_role_fk = users_table.foreignKeys.find(
        fk => fk.columnNames.indexOf('role_id') !== -1
      );
      if (user_role_fk) {
        await query_runner.dropForeignKey('users', user_role_fk);
      }
      await query_runner.query('ALTER TABLE `users` DROP COLUMN `role_id`');
    }
    const role_permissions_table =
      await query_runner.getTable('role_permissions');
    if (role_permissions_table) {
      const foreign_keys = role_permissions_table.foreignKeys;
      for (const fk of foreign_keys) {
        await query_runner.dropForeignKey('role_permissions', fk);
      }
    }
    await query_runner.dropTable('role_permissions');
    await query_runner.dropTable('permissions');
    await query_runner.dropTable('roles');
  }
}
