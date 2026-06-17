import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 로그인 처리
   * loginId와 password를 검증하고 JWT 토큰 발급
   */
  async login(loginDto: LoginDto) {
    const { loginId, password } = loginDto;

    // 사용자 조회
    const user = await this.prisma.user.findUnique({
      where: { loginId },
    });

    if (!user) {
      throw new UnauthorizedException('로그인 ID 또는 비밀번호가 올바르지 않습니다.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다. 관리자에게 문의하세요.');
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('로그인 ID 또는 비밀번호가 올바르지 않습니다.');
    }

    // JWT 페이로드
    const payload = {
      sub: user.id,
      loginId: user.loginId,
      role: user.role,
    };

    // 액세스 토큰 발급
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    // 리프레시 토큰 발급
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    };
  }

  /**
   * 리프레시 토큰으로 새 액세스 토큰 발급
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      const newPayload = {
        sub: user.id,
        loginId: user.loginId,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      });

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('리프레시 토큰이 만료되었거나 유효하지 않습니다.');
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }
}
