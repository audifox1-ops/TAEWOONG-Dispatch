import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
  IsInt,
  IsDateString,
  Min,
  Matches,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DispatchStatus } from '@prisma/client';
import { Type } from 'class-transformer';

// 출발지/도착지 선택지
export const LOCATION_OPTIONS = ['P15', '절단반', '열처리반', '150TON CRANE', '직접입력'] as const;

// 품명 선택지
export const ITEM_OPTIONS = [
  '코깅바', 'SQ 코깅바', 'P/SHAFT', 'I/SHAFT', 'R/STOCK',
  'R/TRUNK', 'TUBE SHEET', 'SHAFT', 'BLIND', 'SHELL', '직접입력',
] as const;

export class CreateDispatchDto {
  @ApiProperty({ example: '2026-06-17', description: '배차 날짜 (YYYY-MM-DD)' })
  @IsDateString({}, { message: '올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요.' })
  dispatchDate: string;

  @ApiProperty({ example: 'P15', description: '출발지' })
  @IsString()
  @IsNotEmpty({ message: '출발지를 입력해주세요.' })
  origin: string;

  @ApiProperty({ example: '절단반', description: '도착지' })
  @IsString()
  @IsNotEmpty({ message: '도착지를 입력해주세요.' })
  destination: string;

  @ApiProperty({ example: 'ORD-2026-001', description: '수주번호' })
  @IsString()
  @IsNotEmpty({ message: '수주번호를 입력해주세요.' })
  orderRefNo: string;

  @ApiProperty({ example: '코깅바', description: '품명' })
  @IsString()
  @IsNotEmpty({ message: '품명을 입력해주세요.' })
  item: string;

  @ApiProperty({ example: 5.5, description: '중량 (TON)' })
  @IsNumber({}, { message: '중량은 숫자여야 합니다.' })
  @IsPositive({ message: '중량은 0보다 커야 합니다.' })
  @Type(() => Number)
  weightTon: number;

  @ApiProperty({ example: 3, description: '수량' })
  @IsInt({ message: '수량은 정수여야 합니다.' })
  @Min(1, { message: '수량은 1 이상이어야 합니다.' })
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({ example: '특이사항 없음', description: '비고' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateDispatchItemDto {
  @ApiProperty({ example: 'P15', description: '출발지' })
  @IsString()
  @IsNotEmpty({ message: '출발지를 입력해주세요.' })
  origin: string;

  @ApiProperty({ example: '단부착', description: '도착지' })
  @IsString()
  @IsNotEmpty({ message: '도착지를 입력해주세요.' })
  destination: string;

  @ApiProperty({ example: 'ORD-2026-001', description: '수주번호' })
  @IsString()
  @IsNotEmpty({ message: '수주번호를 입력해주세요.' })
  orderRefNo: string;

  @ApiProperty({ example: '코팅판', description: '품명' })
  @IsString()
  @IsNotEmpty({ message: '품명을 입력해주세요.' })
  item: string;

  @ApiProperty({ example: 5.5, description: '중량 (TON)' })
  @IsNumber({}, { message: '중량은 숫자여야 합니다.' })
  @IsPositive({ message: '중량은 0보다 커야 합니다.' })
  @Type(() => Number)
  weightTon: number;

  @ApiProperty({ example: 3, description: '수량' })
  @IsInt({ message: '수량은 정수여야 합니다.' })
  @Min(1, { message: '수량은 1 이상이어야 합니다.' })
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({ example: '비고 없음', description: '비고' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateDispatchBatchDto {
  @ApiProperty({ example: '2026-06-17', description: '배차 날짜 (YYYY-MM-DD)' })
  @IsDateString({}, { message: '올바른 날짜 형식(YYYY-MM-DD)으로 입력해주세요.' })
  dispatchDate: string;

  @ApiProperty({ type: [CreateDispatchItemDto], description: '한 번에 저장할 배차 목록' })
  @IsArray()
  @ArrayMinSize(1, { message: '최소 1건 이상 입력해주세요.' })
  @ValidateNested({ each: true })
  @Type(() => CreateDispatchItemDto)
  items: CreateDispatchItemDto[];
}

export class UpdateDispatchDto {
  @ApiPropertyOptional({ example: '2026-06-17', description: '배차 날짜' })
  @IsOptional()
  @IsDateString({}, { message: '올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요.' })
  dispatchDate?: string;

  @ApiPropertyOptional({ example: 'P15', description: '출발지' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '출발지를 입력해주세요.' })
  origin?: string;

  @ApiPropertyOptional({ example: '절단반', description: '도착지' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '도착지를 입력해주세요.' })
  destination?: string;

  @ApiPropertyOptional({ example: 'ORD-2026-001', description: '수주번호' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '수주번호를 입력해주세요.' })
  orderRefNo?: string;

  @ApiPropertyOptional({ example: '코깅바', description: '품명' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '품명을 입력해주세요.' })
  item?: string;

  @ApiPropertyOptional({ example: 5.5, description: '중량 (TON)' })
  @IsOptional()
  @IsNumber({}, { message: '중량은 숫자여야 합니다.' })
  @IsPositive({ message: '중량은 0보다 커야 합니다.' })
  @Type(() => Number)
  weightTon?: number;

  @ApiPropertyOptional({ example: 3, description: '수량' })
  @IsOptional()
  @IsInt({ message: '수량은 정수여야 합니다.' })
  @Min(1, { message: '수량은 1 이상이어야 합니다.' })
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({ example: '특이사항 없음', description: '비고' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: DispatchStatus, description: '변경할 상태' })
  @IsEnum(DispatchStatus, { message: '올바른 상태를 선택해주세요.' })
  status: DispatchStatus;
}

export class DispatchQueryDto {
  @ApiPropertyOptional({ description: '상태 필터' })
  @IsOptional()
  @IsEnum(DispatchStatus)
  status?: DispatchStatus;

  @ApiPropertyOptional({ example: '2026-06-01', description: '시작 날짜' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-06-30', description: '종료 날짜' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ example: '2026-06', description: '월별 다운로드 기준 월 (YYYY-MM)' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;

  @ApiPropertyOptional({ description: '출발지 필터' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ description: '도착지 필터' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ description: '품명 필터' })
  @IsOptional()
  @IsString()
  item?: string;

  @ApiPropertyOptional({ description: '수주번호 필터' })
  @IsOptional()
  @IsString()
  orderRefNo?: string;

  @ApiPropertyOptional({ description: '통합 검색어' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 1, description: '페이지 번호' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: '페이지당 항목 수' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
