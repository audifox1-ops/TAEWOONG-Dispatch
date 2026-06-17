import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChangeType, DispatchStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDispatchDto,
  UpdateDispatchDto,
  UpdateStatusDto,
  DispatchQueryDto,
} from './dto/dispatch.dto';

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 배차번호 자동 생성 (D-YYYYMMDD-NNN)
   * 같은 날짜에 순번을 붙여 유니크한 번호 생성
   */
  private async generateDispatchNo(date: Date): Promise<string> {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    // 해당 날짜의 배차 건수 조회 (소프트 삭제 포함)
    const count = await this.prisma.dispatchOrder.count({
      where: {
        dispatchNo: { startsWith: `D-${dateStr}-` },
      },
    });

    const seq = String(count + 1).padStart(3, '0'); // 001, 002, ...
    return `D-${dateStr}-${seq}`;
  }

  /**
   * 배차지시서 목록 조회 (서버 페이지네이션 + 필터)
   */
  async findAll(query: DispatchQueryDto) {
    const {
      status, dateFrom, dateTo, origin, destination,
      item, orderRefNo, q, page = 1, limit = 20,
    } = query;

    // 기본 필터: 소프트 삭제된 항목 제외
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    // 상태 필터
    if (status) where.status = status;

    // 날짜 범위 필터
    if (dateFrom || dateTo) {
      where.dispatchDate = {};
      if (dateFrom) (where.dispatchDate as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        (where.dispatchDate as Record<string, unknown>).lte = to;
      }
    }

    // 출발지/도착지/품명/수주번호 필터
    if (origin) where.origin = { contains: origin, mode: 'insensitive' };
    if (destination) where.destination = { contains: destination, mode: 'insensitive' };
    if (item) where.item = { contains: item, mode: 'insensitive' };
    if (orderRefNo) where.orderRefNo = { contains: orderRefNo, mode: 'insensitive' };

    // 통합 검색 (OR 조건)
    if (q) {
      where.OR = [
        { dispatchNo: { contains: q, mode: 'insensitive' } },
        { origin: { contains: q, mode: 'insensitive' } },
        { destination: { contains: q, mode: 'insensitive' } },
        { item: { contains: q, mode: 'insensitive' } },
        { orderRefNo: { contains: q, mode: 'insensitive' } },
        { note: { contains: q, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    // N+1 방지: createdBy를 include로 한 번에 조회
    const [total, items] = await Promise.all([
      this.prisma.dispatchOrder.count({ where }),
      this.prisma.dispatchOrder.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, loginId: true },
          },
        },
        orderBy: [{ dispatchDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 배차지시서 단건 조회
   */
  async findOne(id: string) {
    const order = await this.prisma.dispatchOrder.findFirst({
      where: { id, deletedAt: null },
      include: {
        createdBy: {
          select: { id: true, name: true, loginId: true, role: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`배차지시서(ID: ${id})를 찾을 수 없습니다.`);
    }

    return order;
  }

  /**
   * 배차지시서 생성
   * 생성과 동시에 이력(CREATE) 기록
   */
  async create(
    createDto: CreateDispatchDto,
    userId: string,
  ) {
    const dispatchDate = new Date(createDto.dispatchDate);
    const dispatchNo = await this.generateDispatchNo(dispatchDate);

    // 트랜잭션으로 배차지시서 생성 + 이력 기록 원자적 처리
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.dispatchOrder.create({
        data: {
          dispatchNo,
          dispatchDate,
          origin: createDto.origin,
          destination: createDto.destination,
          orderRefNo: createDto.orderRefNo,
          item: createDto.item,
          weightTon: createDto.weightTon,
          quantity: createDto.quantity,
          note: createDto.note,
          status: DispatchStatus.PENDING,
          createdById: userId,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, loginId: true },
          },
        },
      });

      // 생성 이력 저장
      await tx.dispatchHistory.create({
        data: {
          dispatchOrderId: created.id,
          changedById: userId,
          changeType: ChangeType.CREATE,
          afterJson: created as unknown as Record<string, unknown>,
        },
      });

      return created;
    });

    return order;
  }

  /**
   * 배차지시서 수정
   * before/after 스냅샷을 이력에 저장
   */
  async update(
    id: string,
    updateDto: UpdateDispatchDto,
    userId: string,
    userRole: Role,
  ) {
    const existing = await this.findOne(id);

    // 완료/취소된 배차지시서는 수정 불가 (관리자 예외)
    if (
      userRole !== Role.ADMIN &&
      (existing.status === DispatchStatus.COMPLETED ||
        existing.status === DispatchStatus.CANCELED)
    ) {
      throw new ForbiddenException('완료되거나 취소된 배차지시서는 수정할 수 없습니다.');
    }

    const updateData: Record<string, unknown> = {};
    if (updateDto.dispatchDate) updateData.dispatchDate = new Date(updateDto.dispatchDate);
    if (updateDto.origin !== undefined) updateData.origin = updateDto.origin;
    if (updateDto.destination !== undefined) updateData.destination = updateDto.destination;
    if (updateDto.orderRefNo !== undefined) updateData.orderRefNo = updateDto.orderRefNo;
    if (updateDto.item !== undefined) updateData.item = updateDto.item;
    if (updateDto.weightTon !== undefined) updateData.weightTon = updateDto.weightTon;
    if (updateDto.quantity !== undefined) updateData.quantity = updateDto.quantity;
    if (updateDto.note !== undefined) updateData.note = updateDto.note;

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.dispatchOrder.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: {
            select: { id: true, name: true, loginId: true },
          },
        },
      });

      // 수정 이력 저장 (before: 기존, after: 수정 후)
      await tx.dispatchHistory.create({
        data: {
          dispatchOrderId: id,
          changedById: userId,
          changeType: ChangeType.UPDATE,
          beforeJson: existing as unknown as Record<string, unknown>,
          afterJson: result as unknown as Record<string, unknown>,
        },
      });

      return result;
    });

    return updated;
  }

  /**
   * 상태 변경
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
    userId: string,
  ) {
    const existing = await this.findOne(id);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.dispatchOrder.update({
        where: { id },
        data: { status: updateStatusDto.status },
      });

      // 상태 변경 이력 저장
      await tx.dispatchHistory.create({
        data: {
          dispatchOrderId: id,
          changedById: userId,
          changeType: ChangeType.STATUS_CHANGE,
          beforeJson: { status: existing.status } as unknown as Record<string, unknown>,
          afterJson: { status: updateStatusDto.status } as unknown as Record<string, unknown>,
        },
      });

      return result;
    });

    return updated;
  }

  /**
   * 배차지시서 소프트 삭제
   * 이력은 보존
   */
  async remove(id: string, userId: string) {
    const existing = await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      // 소프트 삭제: deletedAt 설정
      await tx.dispatchOrder.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // 삭제 이력 저장
      await tx.dispatchHistory.create({
        data: {
          dispatchOrderId: id,
          changedById: userId,
          changeType: ChangeType.DELETE,
          beforeJson: existing as unknown as Record<string, unknown>,
        },
      });
    });

    return { message: '배차지시서가 삭제되었습니다.' };
  }

  /**
   * 변경 이력 조회
   */
  async getHistory(id: string) {
    // 배차지시서 존재 여부 확인 (삭제된 항목도 포함)
    const order = await this.prisma.dispatchOrder.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`배차지시서(ID: ${id})를 찾을 수 없습니다.`);
    }

    return this.prisma.dispatchHistory.findMany({
      where: { dispatchOrderId: id },
      include: {
        changedBy: {
          select: { id: true, name: true, loginId: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 엑셀 다운로드용 전체 목록 조회 (페이지네이션 없음)
   * 필터는 DispatchQueryDto와 동일
   */
  async findAllForExport(query: Omit<DispatchQueryDto, 'page' | 'limit'>) {
    const where = this.buildWhereClause(query);

    return this.prisma.dispatchOrder.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ dispatchDate: 'asc' }, { dispatchNo: 'asc' }],
    });
  }

  /**
   * WHERE 절 공통 빌더 (캐싱 포인트: Redis로 필터 결과 캐싱 가능)
   */
  private buildWhereClause(query: Omit<DispatchQueryDto, 'page' | 'limit'>) {
    const { status, dateFrom, dateTo, origin, destination, item, orderRefNo, q } = query;
    const where: Record<string, unknown> = { deletedAt: null };

    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.dispatchDate = {};
      if (dateFrom) (where.dispatchDate as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        (where.dispatchDate as Record<string, unknown>).lte = to;
      }
    }
    if (origin) where.origin = { contains: origin, mode: 'insensitive' };
    if (destination) where.destination = { contains: destination, mode: 'insensitive' };
    if (item) where.item = { contains: item, mode: 'insensitive' };
    if (orderRefNo) where.orderRefNo = { contains: orderRefNo, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { dispatchNo: { contains: q, mode: 'insensitive' } },
        { origin: { contains: q, mode: 'insensitive' } },
        { destination: { contains: q, mode: 'insensitive' } },
        { item: { contains: q, mode: 'insensitive' } },
        { orderRefNo: { contains: q, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
