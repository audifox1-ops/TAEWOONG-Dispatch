import { PrismaClient, Role, DispatchStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('🌱 시드 데이터 삽입 시작...');

  // ===========================
  // 1. 사용자 생성
  // ===========================
  const adminHash = await bcrypt.hash('Admin1234!', BCRYPT_ROUNDS);
  const dispHash = await bcrypt.hash('Disp1234!', BCRYPT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { loginId: 'admin' },
    update: {},
    create: {
      loginId: 'admin',
      name: '시스템 관리자',
      passwordHash: adminHash,
      role: Role.ADMIN,
      phone: '010-0000-0000',
      isActive: true,
    },
  });

  const dispatcher1 = await prisma.user.upsert({
    where: { loginId: 'dispatcher1' },
    update: {},
    create: {
      loginId: 'dispatcher1',
      name: '김배차',
      passwordHash: dispHash,
      role: Role.DISPATCHER,
      phone: '010-1111-2222',
      isActive: true,
    },
  });

  const dispatcher2 = await prisma.user.upsert({
    where: { loginId: 'dispatcher2' },
    update: {},
    create: {
      loginId: 'dispatcher2',
      name: '이담당',
      passwordHash: dispHash,
      role: Role.DISPATCHER,
      phone: '010-3333-4444',
      isActive: true,
    },
  });

  console.log('✅ 사용자 3명 생성 완료');

  // ===========================
  // 2. 배차지시서 샘플 데이터 (여러 날짜에 걸쳐 8건 - 날짜별 시트 분리 확인용)
  // ===========================
  const sampleOrders = [
    // 2026-06-10 (2건)
    {
      dispatchDate: new Date('2026-06-10'),
      origin: 'P15',
      destination: '절단반',
      orderRefNo: 'ORD-2026-001',
      item: '코깅바',
      weightTon: 8.5,
      quantity: 2,
      status: DispatchStatus.COMPLETED,
      note: '긴급 처리 완료',
      createdById: dispatcher1.id,
    },
    {
      dispatchDate: new Date('2026-06-10'),
      origin: '절단반',
      destination: '열처리반',
      orderRefNo: 'ORD-2026-002',
      item: 'P/SHAFT',
      weightTon: 12.3,
      quantity: 1,
      status: DispatchStatus.COMPLETED,
      note: null,
      createdById: dispatcher2.id,
    },
    // 2026-06-12 (2건)
    {
      dispatchDate: new Date('2026-06-12'),
      origin: '열처리반',
      destination: '150TON CRANE',
      orderRefNo: 'ORD-2026-003',
      item: 'SHAFT',
      weightTon: 25.0,
      quantity: 1,
      status: DispatchStatus.COMPLETED,
      note: '무게 주의',
      createdById: dispatcher1.id,
    },
    {
      dispatchDate: new Date('2026-06-12'),
      origin: 'P15',
      destination: '열처리반',
      orderRefNo: 'ORD-2026-004',
      item: 'SQ 코깅바',
      weightTon: 6.8,
      quantity: 3,
      status: DispatchStatus.CANCELED,
      note: '수주 취소로 인한 배차 취소',
      createdById: dispatcher2.id,
    },
    // 2026-06-15 (2건)
    {
      dispatchDate: new Date('2026-06-15'),
      origin: 'P15',
      destination: '절단반',
      orderRefNo: 'ORD-2026-005',
      item: 'TUBE SHEET',
      weightTon: 18.5,
      quantity: 2,
      status: DispatchStatus.IN_PROGRESS,
      note: null,
      createdById: dispatcher1.id,
    },
    {
      dispatchDate: new Date('2026-06-15'),
      origin: '절단반',
      destination: '150TON CRANE',
      orderRefNo: 'ORD-2026-006',
      item: 'SHELL',
      weightTon: 32.1,
      quantity: 1,
      status: DispatchStatus.IN_PROGRESS,
      note: '크레인 사용 예약 확인 요망',
      createdById: dispatcher2.id,
    },
    // 2026-06-17 (2건 - 오늘 날짜)
    {
      dispatchDate: new Date('2026-06-17'),
      origin: 'P15',
      destination: '열처리반',
      orderRefNo: 'ORD-2026-007',
      item: 'I/SHAFT',
      weightTon: 9.2,
      quantity: 2,
      status: DispatchStatus.PENDING,
      note: null,
      createdById: dispatcher1.id,
    },
    {
      dispatchDate: new Date('2026-06-17'),
      origin: '열처리반',
      destination: 'P15',
      orderRefNo: 'ORD-2026-008',
      item: 'R/STOCK',
      weightTon: 4.5,
      quantity: 5,
      status: DispatchStatus.PENDING,
      note: '반환 처리',
      createdById: dispatcher2.id,
    },
  ];

  let orderIdx = 0;
  for (const orderData of sampleOrders) {
    const dateStr = orderData.dispatchDate.toISOString().slice(0, 10).replace(/-/g, '');
    // 같은 날짜 내 순번 계산
    const sameDateOrders = sampleOrders.slice(0, orderIdx).filter(
      (o) => o.dispatchDate.toISOString().slice(0, 10) === orderData.dispatchDate.toISOString().slice(0, 10),
    );
    const seq = String(sameDateOrders.length + 1).padStart(3, '0');
    const dispatchNo = `D-${dateStr}-${seq}`;

    const existing = await prisma.dispatchOrder.findUnique({ where: { dispatchNo } });
    if (!existing) {
      const created = await prisma.dispatchOrder.create({
        data: {
          ...orderData,
          dispatchNo,
        },
      });

      // 생성 이력 기록
      await prisma.dispatchHistory.create({
        data: {
          dispatchOrderId: created.id,
          changedById: orderData.createdById,
          changeType: 'CREATE',
          afterJson: created as unknown as Record<string, unknown>,
        },
      });
    }
    orderIdx++;
  }

  console.log('✅ 배차지시서 샘플 8건 생성 완료');
  console.log('');
  console.log('==============================================');
  console.log('🔑 기본 로그인 계정:');
  console.log('  관리자: admin / Admin1234!');
  console.log('  담당자1: dispatcher1 / Disp1234!');
  console.log('  담당자2: dispatcher2 / Disp1234!');
  console.log('==============================================');
}

main()
  .catch((e) => {
    console.error('❌ 시드 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
