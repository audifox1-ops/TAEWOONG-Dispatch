import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'dispatcher1', description: '로그인 ID' })
  @IsString()
  @IsNotEmpty({ message: '로그인 ID를 입력해주세요.' })
  loginId: string;

  @ApiProperty({ example: '홍길동', description: '이름' })
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string;

  @ApiProperty({ example: 'Password123!', description: '비밀번호' })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/, {
    message: '비밀번호는 영문자와 숫자를 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({ enum: Role, example: Role.DISPATCHER, description: '역할' })
  @IsEnum(Role, { message: '올바른 역할을 선택해주세요.' })
  role: Role;

  @ApiPropertyOptional({ example: '010-1234-5678', description: '연락처' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: '홍길동', description: '이름' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name?: string;

  @ApiPropertyOptional({ example: 'NewPass123!', description: '새 비밀번호' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password?: string;

  @ApiPropertyOptional({ enum: Role, description: '역할' })
  @IsOptional()
  @IsEnum(Role, { message: '올바른 역할을 선택해주세요.' })
  role?: Role;

  @ApiPropertyOptional({ example: '010-1234-5678', description: '연락처' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: true, description: '활성 여부' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
