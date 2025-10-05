import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey
} from 'typeorm';

export class CreateIpWhitelistTable1759925741155 implements MigrationInterface {
  public async up(query_runner: QueryRunner): Promise<void> {
    await query_runner.createTable(
      new Table({
        name: 'ip_whitelist',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '36',
            isNullable: true
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '100'
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
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true
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
    await query_runner.createForeignKey(
      'ip_whitelist',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE'
      })
    );
    await query_runner.query(
      'CREATE INDEX `IDX_IP_WHITELIST_USER_ID` ON `ip_whitelist` (`user_id`)'
    );
    await query_runner.query(
      'CREATE INDEX `IDX_IP_WHITELIST_IS_ACTIVE` ON `ip_whitelist` (`is_active`)'
    );
  }

  public async down(query_runner: QueryRunner): Promise<void> {
    await query_runner.dropTable('ip_whitelist');
  }
}
