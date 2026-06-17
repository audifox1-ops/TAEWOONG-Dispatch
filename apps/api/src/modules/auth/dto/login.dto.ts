import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: '로그인 ID' })
  @IsString()
  @IsNotEmpty({ message: '로그인 ID를 입력해주세요.' })
  loginId: string;

  @ApiProperty({ example: 'Admin1234!', description: '비밀번호' })
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;
}
