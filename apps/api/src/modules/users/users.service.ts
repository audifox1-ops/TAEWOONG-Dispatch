import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

const BCRYPT_ROUNDS = 12; // bcrypt 해싱 강도

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 전체 사용자 목록 조회
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * 특정 사용자 조회
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`사용자(ID: ${id})를 찾을 수 없습니다.`);
    }

    return user;
  }

  /**
   * 사용자 생성
   */
  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;

    // 로그인 ID 중복 체크
    const existing = await this.prisma.user.findUnique({
      where: { loginId: rest.loginId },
    });

    if (existing) {
      throw new ConflictException(`이미 사용 중인 로그인 ID입니다: ${rest.loginId}`);
    }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        passwordHash,
      },
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * 사용자 수정
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // 존재 여부 확인
    await this.findOne(id);

    const { password, ...rest } = updateUserDto;
    const updateData: Record<string, unknown> = { ...rest };

    // 비밀번호 변경 시 해싱
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  /**
   * 사용자 삭제 (비활성화 처리)
   */
  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  }
}
