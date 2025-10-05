import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';

export class QueryBuilderUtil {
  static ApplyPagination<T extends ObjectLiteral>(
    query_builder: SelectQueryBuilder<T>,
    pagination_dto: PaginationDto
  ): SelectQueryBuilder<T> {
    const { page = 1, limit = 10 } = pagination_dto;
    const skip = (page - 1) * limit;
    return query_builder.skip(skip).take(limit);
  }

  static ApplySorting<T extends ObjectLiteral>(
    query_builder: SelectQueryBuilder<T>,
    pagination_dto: PaginationDto,
    alias: string,
    default_sort_field: string = 'created_at'
  ): SelectQueryBuilder<T> {
    const { sort_by, order = 'DESC' } = pagination_dto;
    const sort_field = sort_by || default_sort_field;
    return query_builder.orderBy(`${alias}.${sort_field}`, order);
  }

  static ApplySearch<T extends ObjectLiteral>(
    query_builder: SelectQueryBuilder<T>,
    pagination_dto: PaginationDto,
    alias: string,
    search_fields: string[]
  ): SelectQueryBuilder<T> {
    const { search } = pagination_dto;
    if (search && search_fields.length > 0) {
      const conditions = search_fields
        .map(field => `${alias}.${field} LIKE :search`)
        .join(' OR ');
      query_builder.andWhere(`(${conditions})`, {
        search: `%${search}%`
      });
    }
    return query_builder;
  }

  static SelectFields<T extends ObjectLiteral>(
    query_builder: SelectQueryBuilder<T>,
    alias: string,
    fields: string[]
  ): SelectQueryBuilder<T> {
    if (fields && fields.length > 0) {
      const select_fields = fields.map(field => `${alias}.${field}`);
      return query_builder.select(select_fields);
    }
    return query_builder;
  }

  static ApplyCache<T extends ObjectLiteral>(
    query_builder: SelectQueryBuilder<T>,
    cache_key: string,
    cache_duration: number = 30000
  ): SelectQueryBuilder<T> {
    return query_builder.cache(cache_key, cache_duration);
  }

  static ApplyAll<T extends ObjectLiteral>(
    query_builder: SelectQueryBuilder<T>,
    pagination_dto: PaginationDto,
    alias: string,
    options: {
      search_fields?: string[];
      default_sort_field?: string;
      cache_key?: string;
      cache_duration?: number;
    } = {}
  ): SelectQueryBuilder<T> {
    const {
      search_fields = [],
      default_sort_field = 'created_at',
      cache_key,
      cache_duration = 30000
    } = options;
    if (search_fields.length > 0) {
      this.ApplySearch(query_builder, pagination_dto, alias, search_fields);
    }
    this.ApplySorting(query_builder, pagination_dto, alias, default_sort_field);
    this.ApplyPagination(query_builder, pagination_dto);
    if (cache_key) {
      this.ApplyCache(query_builder, cache_key, cache_duration);
    }
    return query_builder;
  }
}
