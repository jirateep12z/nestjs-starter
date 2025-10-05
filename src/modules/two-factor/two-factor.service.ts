import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(User)
    private readonly user_repository: Repository<User>
  ) {}

  async GenerateSecret(user_id: string): Promise<{
    secret: string;
    qr_code: string;
  }> {
    const user = await this.user_repository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new BadRequestException({
        en: 'User not found',
        th: 'ไม่พบผู้ใช้'
      });
    }
    const secret = speakeasy.generateSecret({
      name: `NestJS Starter (${user.email})`,
      length: 32
    });
    const qr_code = await QRCode.toDataURL(secret.otpauth_url!);
    return {
      secret: secret.base32,
      qr_code
    };
  }

  async EnableTwoFactor(
    user_id: string,
    token: string,
    secret: string
  ): Promise<void> {
    const is_valid = this.VerifyToken(secret, token);
    if (!is_valid) {
      throw new BadRequestException({
        en: 'Invalid verification code',
        th: 'รหัสยืนยันไม่ถูกต้อง'
      });
    }
    const user = await this.user_repository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new BadRequestException({
        en: 'User not found',
        th: 'ไม่พบผู้ใช้'
      });
    }
    user.two_factor_enabled = true;
    user.two_factor_secret = secret;
    await this.user_repository.save(user);
  }

  async DisableTwoFactor(user_id: string, token: string): Promise<void> {
    const user = await this.user_repository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new BadRequestException({
        en: 'User not found',
        th: 'ไม่พบผู้ใช้'
      });
    }
    if (!user.two_factor_enabled || !user.two_factor_secret) {
      throw new BadRequestException({
        en: 'Two-factor authentication is not enabled',
        th: 'การยืนยันตัวตนสองขั้นตอนยังไม่ได้เปิดใช้งาน'
      });
    }
    const is_valid = this.VerifyToken(user.two_factor_secret, token);
    if (!is_valid) {
      throw new BadRequestException({
        en: 'Invalid verification code',
        th: 'รหัสยืนยันไม่ถูกต้อง'
      });
    }
    user.two_factor_enabled = false;
    user.two_factor_secret = null;
    await this.user_repository.save(user);
  }

  VerifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
  }

  async ValidateTwoFactor(user_id: string, token: string): Promise<boolean> {
    const user = await this.user_repository.findOne({ where: { id: user_id } });
    if (!user) {
      return false;
    }
    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return false;
    }
    return this.VerifyToken(user.two_factor_secret, token);
  }
}
