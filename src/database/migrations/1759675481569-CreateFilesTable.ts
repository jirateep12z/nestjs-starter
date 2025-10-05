import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey
} from 'typeorm';

export class CreateFilesTable1759675481569 implements MigrationInterface {
  public async up(query_runner: QueryRunner): Promise<void> {
    await query_runner.createTable(
      new Table({
        name: 'files',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'uploaded_by',
            type: 'varchar',
            length: '36',
            isNullable: true
          },
          {
            name: 'original_name',
            type: 'varchar',
            length: '255'
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
            isUnique: true
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100'
          },
          {
            name: 'size',
            type: 'bigint'
          },
          {
            name: 'file_path',
            type: 'varchar',
            length: '500'
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'file_type',
            type: 'enum',
            enum: ['image', 'document', 'video', 'audio', 'other'],
            default: "'other'"
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          }
        ]
      }),
      true
    );
    await query_runner.createForeignKey(
      'files',
      new TableForeignKey({
        name: 'FK_FILES_UPLOADED_BY',
        columnNames: ['uploaded_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL'
      })
    );
    await query_runner.query(
      'CREATE INDEX `IDX_FILES_UPLOADED_BY` ON `files` (`uploaded_by`)'
    );
    await query_runner.query(
      'CREATE INDEX `IDX_FILES_FILE_NAME` ON `files` (`file_name`)'
    );
  }

  public async down(query_runner: QueryRunner): Promise<void> {
    const files_table = await query_runner.getTable('files');
    if (files_table) {
      const foreign_keys = files_table.foreignKeys;
      for (const fk of foreign_keys) {
        await query_runner.dropForeignKey('files', fk);
      }
    }
    await query_runner.dropTable('files');
  }
}
