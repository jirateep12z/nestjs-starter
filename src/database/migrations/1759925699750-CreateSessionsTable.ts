import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey
} from 'typeorm';

export class CreateSessionsTable1759925699750 implements MigrationInterface {
  public async up(query_runner: QueryRunner): Promise<void> {
    await query_runner.createTable(
      new Table({
        name: 'sessions',
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
            length: '36'
          },
          {
            name: 'refresh_token',
            type: 'varchar',
            length: '500'
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true
          },
          {
            name: 'last_activity',
            type: 'timestamp',
            isNullable: true
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
      'sessions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE'
      })
    );
    await query_runner.query(
      'CREATE INDEX `IDX_SESSIONS_USER_ID` ON `sessions` (`user_id`)'
    );
    await query_runner.query(
      'CREATE INDEX `IDX_SESSIONS_IS_ACTIVE` ON `sessions` (`is_active`)'
    );
  }

  public async down(query_runner: QueryRunner): Promise<void> {
    await query_runner.dropTable('sessions');
  }
}
