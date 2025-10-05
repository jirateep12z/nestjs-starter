import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateNotificationTemplatesTable1759980450219
  implements MigrationInterface
{
  public async up(query_runner: QueryRunner): Promise<void> {
    await query_runner.createTable(
      new Table({
        name: 'notification_templates',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: '(UUID())'
          },
          {
            name: 'template_code',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'template_name',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'category',
            type: 'enum',
            enum: [
              'security',
              'system',
              'user',
              'marketing',
              'transaction',
              'other'
            ],
            default: "'other'",
            isNullable: false
          },
          {
            name: 'channels',
            type: 'text',
            isNullable: false,
            comment: 'รายการช่องทางการแจ้งเตือนแบบคั่นด้วยเครื่องหมายจุลภาค'
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '500',
            isNullable: false
          },
          {
            name: 'body_template',
            type: 'text',
            isNullable: false
          },
          {
            name: 'variables',
            type: 'json',
            isNullable: true,
            comment: 'อาร์เรย์ของชื่อตัวแปรที่ใช้ในเทมเพลต'
          },
          {
            name: 'default_values',
            type: 'json',
            isNullable: true,
            comment: 'ค่าเริ่มต้นสำหรับตัวแปรในเทมเพลต'
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
            comment: 'ข้อมูลเมตาเพิ่มเติมสำหรับเทมเพลต'
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false
          },
          {
            name: 'priority',
            type: 'int',
            default: 0,
            isNullable: false,
            comment: 'เทมเพลตที่มีลำดับความสำคัญสูงกว่าจะถูกเลือกใช้ก่อน'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false
          }
        ]
      }),
      true
    );
    await query_runner.createIndex(
      'notification_templates',
      new TableIndex({
        name: 'IDX_notification_templates_template_code',
        columnNames: ['template_code']
      })
    );
    await query_runner.createIndex(
      'notification_templates',
      new TableIndex({
        name: 'IDX_notification_templates_category',
        columnNames: ['category']
      })
    );
    await query_runner.createIndex(
      'notification_templates',
      new TableIndex({
        name: 'IDX_notification_templates_is_active',
        columnNames: ['is_active']
      })
    );
    await query_runner.createIndex(
      'notification_templates',
      new TableIndex({
        name: 'IDX_notification_templates_priority',
        columnNames: ['priority']
      })
    );
  }

  public async down(query_runner: QueryRunner): Promise<void> {
    await query_runner.dropTable('notification_templates', true);
  }
}
