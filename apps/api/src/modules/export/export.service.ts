import { Injectable, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';
import { DispatchService } from '../dispatch/dispatch.service';
import { DispatchQueryDto } from '../dispatch/dto/dispatch.dto';
import { DispatchStatus } from '@prisma/client';

// 엑셀 헤더 정의 (요구사항 순서 준수)
const EXCEL_HEADERS = [
  '날짜', '배차번호', '출발지', '도착지', '수주번호',
  '품명', '중량(TON)', '수량', '상태', '비고',
];

// 상태 한국어 변환
const STATUS_LABELS: Record<DispatchStatus, string> = {
  [DispatchStatus.PENDING]: '대기',
  [DispatchStatus.IN_PROGRESS]: '진행 중',
  [DispatchStatus.COMPLETED]: '완료',
  [DispatchStatus.CANCELED]: '취소',
};

@Injectable()
export class ExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatchService: DispatchService,
  ) {}

  /**
   * 배차지시서 단건 엑셀 다운로드
   */
  async exportSingle(id: string): Promise<Buffer> {
    const order = await this.dispatchService.findOne(id);

    const wb = XLSX.utils.book_new();

    // 단건 데이터 행 생성
    const row = this.mapOrderToRow(order);
    const ws = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS, row]);

    // 열 너비 자동 조정
    ws['!cols'] = this.getColumnWidths(EXCEL_HEADERS);

    // 헤더 스타일 적용
    this.applyHeaderStyle(ws, EXCEL_HEADERS.length);

    XLSX.utils.book_append_sheet(wb, ws, '배차지시서');

    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }

  /**
   * 배차지시서 목록 엑셀 다운로드 (날짜별 시트 분리)
   * 요구사항: 배차 날짜(dispatchDate)를 기준으로 날짜마다 별도 시트
   */
  async exportList(query: Omit<DispatchQueryDto, 'page' | 'limit'>): Promise<Buffer> {
    const orders = await this.dispatchService.findAllForExport(query);

    const wb = XLSX.utils.book_new();

    // === 요약 시트 (맨 앞) ===
    const summaryData = [
      ['구분', '건수'],
      ['전체', orders.length],
      ['대기', orders.filter((o) => o.status === DispatchStatus.PENDING).length],
      ['진행 중', orders.filter((o) => o.status === DispatchStatus.IN_PROGRESS).length],
      ['완료', orders.filter((o) => o.status === DispatchStatus.COMPLETED).length],
      ['취소', orders.filter((o) => o.status === DispatchStatus.CANCELED).length],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, '요약');

    // === 날짜별 시트 분리 ===
    // 날짜(YYYY-MM-DD)를 키로 그룹화
    const grouped = new Map<string, typeof orders>();
    for (const order of orders) {
      const dateKey = order.dispatchDate.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(order);
    }

    // 날짜 오름차순 정렬
    const sortedDates = Array.from(grouped.keys()).sort();

    for (const dateKey of sortedDates) {
      const dateOrders = grouped.get(dateKey)!;

      // 시트에 넣을 데이터 (헤더 + 행들)
      const rows = dateOrders.map((order) => this.mapOrderToRow(order));
      const wsData = [EXCEL_HEADERS, ...rows];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // 열 너비 자동 조정
      ws['!cols'] = this.getColumnWidths(EXCEL_HEADERS);

      // 헤더 스타일 적용
      this.applyHeaderStyle(ws, EXCEL_HEADERS.length);

      // 시트명: YYYY-MM-DD (31자 이내, 특수문자 없음)
      const sheetName = dateKey.slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    // 데이터가 없을 때 빈 시트 추가 (최소 1개 시트 필요)
    if (sortedDates.length === 0) {
      const emptyWs = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS]);
      XLSX.utils.book_append_sheet(wb, emptyWs, '데이터없음');
    }

    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }

  /**
   * 배차지시서 데이터를 엑셀 행으로 변환
   */
  private mapOrderToRow(order: Record<string, unknown>): (string | number)[] {
    const dispatchDate = order.dispatchDate as Date;
    return [
      dispatchDate ? dispatchDate.toISOString().slice(0, 10) : '',
      (order.dispatchNo as string) || '',
      (order.origin as string) || '',
      (order.destination as string) || '',
      (order.orderRefNo as string) || '',
      (order.item as string) || '',
      (order.weightTon as number) || 0,
      (order.quantity as number) || 0,
      STATUS_LABELS[(order.status as DispatchStatus)] || '',
      (order.note as string) || '',
    ];
  }

  /**
   * 헤더에 맞는 열 너비 반환
   */
  private getColumnWidths(headers: string[]): XLSX.ColInfo[] {
    const widths: Record<string, number> = {
      '날짜': 12,
      '배차번호': 18,
      '출발지': 15,
      '도착지': 15,
      '수주번호': 18,
      '품명': 15,
      '중량(TON)': 12,
      '수량': 8,
      '상태': 12,
      '비고': 30,
    };

    return headers.map((h) => ({ wch: widths[h] || 15 }));
  }

  /**
   * 헤더 행 스타일 적용
   */
  private applyHeaderStyle(ws: XLSX.WorkSheet, colCount: number): void {
    for (let i = 0; i < colCount; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!ws[cellRef]) continue;
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1E3A5F' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
    }
  }
}
