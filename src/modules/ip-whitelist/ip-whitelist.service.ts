import {
  Injectable,
  ForbiddenException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IpWhitelist } from './entities/ip-whitelist.entity';
import { CreateIpWhitelistDto } from './dto/create-ip-whitelist.dto';
import { UpdateIpWhitelistDto } from './dto/update-ip-whitelist.dto';
import {
  PaginationDto,
  PaginatedResult,
  PaginationHelper
} from '../../common/dto/pagination.dto';
import { QueryBuilderUtil } from '../../common/utils/query-builder.util';
import CIDR from 'ip-cidr';

@Injectable()
export class IpWhitelistService {
  constructor(
    @InjectRepository(IpWhitelist)
    private readonly ip_whitelist_repository: Repository<IpWhitelist>
  ) {}

  async Create(
    create_ip_whitelist_dto: CreateIpWhitelistDto
  ): Promise<IpWhitelist> {
    const ip_whitelist = this.ip_whitelist_repository.create(
      create_ip_whitelist_dto
    );
    return await this.ip_whitelist_repository.save(ip_whitelist);
  }

  async FindAll(
    pagination_dto?: PaginationDto
  ): Promise<PaginatedResult<IpWhitelist>> {
    const query_builder =
      this.ip_whitelist_repository.createQueryBuilder('ip_whitelist');
    if (pagination_dto) {
      QueryBuilderUtil.ApplyAll(query_builder, pagination_dto, 'ip_whitelist', {
        search_fields: ['ip_address', 'description'],
        default_sort_field: 'created_at'
      });
    } else {
      query_builder.orderBy('ip_whitelist.created_at', 'DESC');
    }
    const [items, total] = await query_builder.getManyAndCount();
    if (pagination_dto) {
      return PaginationHelper.CreateResult(
        items,
        pagination_dto.page || 1,
        pagination_dto.limit || 10,
        total
      );
    }
    return PaginationHelper.CreateResult(items, 1, items.length, total);
  }

  async FindByUserId(user_id: string): Promise<IpWhitelist[]> {
    return await this.ip_whitelist_repository.find({
      where: { user_id, is_active: true },
      order: { created_at: 'DESC' }
    });
  }

  async FindOne(id: string): Promise<IpWhitelist> {
    const ip_whitelist = await this.ip_whitelist_repository.findOne({
      where: { id }
    });
    if (!ip_whitelist) {
      throw new NotFoundException({
        en: 'IP whitelist entry not found',
        th: 'ไม่พบรายการ IP Whitelist'
      });
    }
    return ip_whitelist;
  }

  async Update(
    id: string,
    update_ip_whitelist_dto: UpdateIpWhitelistDto
  ): Promise<IpWhitelist> {
    const ip_whitelist = await this.FindOne(id);
    Object.assign(ip_whitelist, update_ip_whitelist_dto);
    return await this.ip_whitelist_repository.save(ip_whitelist);
  }

  async Remove(id: string): Promise<void> {
    const ip_whitelist = await this.FindOne(id);
    await this.ip_whitelist_repository.remove(ip_whitelist);
  }

  async CheckIpWhitelist(
    user_id: string,
    ip_address: string
  ): Promise<boolean> {
    const whitelist_entries = await this.FindByUserId(user_id);
    if (whitelist_entries.length === 0) {
      return true;
    }
    const is_whitelisted = whitelist_entries.some(entry => {
      if (entry.ip_address === ip_address) {
        return true;
      }
      if (entry.ip_address.includes('/')) {
        return this.IsIpInCidr(ip_address, entry.ip_address);
      }
      return false;
    });
    if (!is_whitelisted) {
      throw new ForbiddenException({
        en: 'Access denied: IP address not whitelisted',
        th: 'การเข้าถึงถูกปฏิเสธ: IP address ไม่อยู่ในรายการที่อนุญาต'
      });
    }
    return true;
  }

  private IsIpInCidr(ip: string, cidr: string): boolean {
    try {
      const cidr_checker = new CIDR(cidr);
      return cidr_checker.contains(ip);
    } catch (error) {
      return false;
    }
  }
}
