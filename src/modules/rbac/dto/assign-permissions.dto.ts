import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'รายการ Permission IDs ที่ต้องการกำหนดให้ Role',
    type: [String],
    example: ['uuid-1', 'uuid-2', 'uuid-3']
  })
  @IsArray()
  @IsUUID('4', { each: true })
  permission_ids: string[];
}
