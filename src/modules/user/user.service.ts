import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  PaginationDto,
  PaginatedResult,
  PaginationHelper
} from '../../common/dto/pagination.dto';
import { QueryBuilderUtil } from '../../common/utils/query-builder.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly user_repository: Repository<User>
  ) {}

  async Create(create_user_dto: CreateUserDto): Promise<User> {
    try {
      const existing_user = await this.user_repository.findOne({
        where: { email: create_user_dto.email }
      });
      if (existing_user) {
        throw new ConflictException({
          en: 'This email is already in use',
          th: 'อีเมลนี้ถูกใช้งานแล้ว'
        });
      }
      const user = this.user_repository.create(create_user_dto);
      return await this.user_repository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        en: 'Unable to create user',
        th: 'ไม่สามารถสร้างผู้ใช้ได้'
      });
    }
  }

  async FindAll(
    pagination_dto?: PaginationDto
  ): Promise<PaginatedResult<User>> {
    const query_builder = this.user_repository.createQueryBuilder('user');
    if (pagination_dto) {
      QueryBuilderUtil.ApplyAll(query_builder, pagination_dto, 'user', {
        search_fields: ['email', 'first_name', 'last_name'],
        default_sort_field: 'created_at',
        cache_key: 'users_list',
        cache_duration: 60000
      });
    } else {
      query_builder.orderBy('user.created_at', 'DESC');
    }
    const [users, total] = await query_builder.getManyAndCount();
    if (pagination_dto) {
      return PaginationHelper.CreateResult(
        users,
        pagination_dto.page || 1,
        pagination_dto.limit || 10,
        total
      );
    }
    return PaginationHelper.CreateResult(users, 1, users.length, total);
  }

  async FindOne(id: string): Promise<User> {
    const user = await this.user_repository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        en: 'User not found',
        th: 'ไม่พบผู้ใช้'
      });
    }
    return user;
  }

  async FindByEmail(email: string): Promise<User | null> {
    return await this.user_repository.findOne({ where: { email } });
  }

  async FindByEmailWithRole(email: string): Promise<User | null> {
    return await this.user_repository.findOne({
      where: { email },
      relations: ['role_entity', 'role_entity.permissions']
    });
  }

  async Update(
    id: string,
    update_user_dto: UpdateUserDto,
    current_user_id?: string
  ): Promise<User> {
    const target_user = await this.user_repository.findOne({
      where: { id },
      relations: ['role_entity']
    });
    if (!target_user) {
      throw new NotFoundException({
        en: 'User not found',
        th: 'ไม่พบผู้ใช้'
      });
    }
    if (current_user_id) {
      await this.CheckRolePriority(current_user_id, target_user);
    }
    Object.assign(target_user, update_user_dto);
    try {
      return await this.user_repository.save(target_user);
    } catch (error) {
      throw new BadRequestException({
        en: 'Unable to update user',
        th: 'ไม่สามารถอัปเดตผู้ใช้ได้'
      });
    }
  }

  async Remove(id: string, current_user_id?: string): Promise<void> {
    const target_user = await this.user_repository.findOne({
      where: { id },
      relations: ['role_entity']
    });
    if (!target_user) {
      throw new NotFoundException({
        en: 'User not found',
        th: 'ไม่พบผู้ใช้'
      });
    }
    if (current_user_id) {
      await this.CheckRolePriority(current_user_id, target_user);
    }
    try {
      await this.user_repository.remove(target_user);
    } catch (error) {
      throw new BadRequestException({
        en: 'Unable to delete user',
        th: 'ไม่สามารถลบผู้ใช้ได้'
      });
    }
  }

  async UpdateRefreshToken(
    user_id: string,
    refresh_token: string | null
  ): Promise<void> {
    await this.user_repository.update(user_id, { refresh_token });
  }

  private async CheckRolePriority(
    current_user_id: string,
    target_user: User
  ): Promise<void> {
    const current_user = await this.user_repository.findOne({
      where: { id: current_user_id },
      relations: ['role_entity']
    });
    if (!current_user || !current_user.role_entity) {
      throw new ForbiddenException({
        en: 'You do not have permission to perform this action',
        th: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้'
      });
    }
    if (!target_user.role_entity) {
      return;
    }
    const current_priority = current_user.role_entity.priority;
    const target_priority = target_user.role_entity.priority;
    if (target_priority > current_priority) {
      throw new ForbiddenException({
        en: 'You cannot perform actions on users with higher role priority',
        th: 'คุณไม่สามารถดำเนินการกับผู้ใช้ที่มีระดับสิทธิ์สูงกว่าได้'
      });
    }
  }
}
