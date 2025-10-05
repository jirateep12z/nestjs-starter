import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'หน้าที่ต้องการดึงข้อมูล',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'จำนวนรายการต่อหน้า',
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'ฟิลด์ที่ต้องการเรียงลำดับ',
    example: 'created_at'
  })
  @IsOptional()
  sort_by?: string;

  @ApiPropertyOptional({
    description: 'ทิศทางการเรียงลำดับ (ASC หรือ DESC)',
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'คำค้นหา',
    example: 'search term'
  })
  @IsOptional()
  search?: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_previous_page: boolean;
  has_next_page: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  metadata: PaginationMetadata;
}

export class PaginationHelper {
  static CreateMetadata(
    page: number,
    limit: number,
    total_items: number
  ): PaginationMetadata {
    const total_pages = Math.ceil(total_items / limit);
    return {
      page,
      limit,
      total_items,
      total_pages,
      has_previous_page: page > 1,
      has_next_page: page < total_pages
    };
  }

  static CreateResult<T>(
    data: T[],
    page: number,
    limit: number,
    total_items: number
  ): PaginatedResult<T> {
    return {
      data,
      metadata: this.CreateMetadata(page, limit, total_items)
    };
  }

  static GetSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
