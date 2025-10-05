import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1759675341488 implements MigrationInterface {
  public async up(query_runner: QueryRunner): Promise<void> {
    await query_runner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255'
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'refresh_token',
            type: 'varchar',
            length: '500',
            isNullable: true
          },
          {
            name: 'two_factor_enabled',
            type: 'boolean',
            default: false
          },
          {
            name: 'two_factor_secret',
            type: 'varchar',
            length: '255',
            isNullable: true
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
    await query_runner.query(
      'CREATE INDEX `IDX_USERS_EMAIL` ON `users` (`email`)'
    );
  }

  public async down(query_runner: QueryRunner): Promise<void> {
    await query_runner.dropTable('users');
  }
}
