import { Injectable, NotFoundException } from '@nestjs/common';
import { DispatchStatus } from '@prisma/client';
import * as XLSX from 'xlsx';
import { DispatchService } from '../dispatch/dispatch.service';
import { DispatchQueryDto } from '../dispatch/dto/dispatch.dto';

const EXCEL_HEADERS = [
  '날짜',
  '배차번호',
  '출발지',
  '도착지',
  '수주번호',
  '품명',
  '중량(TON)',
  '수량',
  '상태',
  '비고',
];

const STATUS_LABELS: Record<DispatchStatus, string> = {
  PENDING: '대기',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  CANCELED: '취소',
};

type ExportRowSource = {
  dispatchDate: Date | string;
  dispatchNo: string;
  origin: string;
  destination: string;
  orderRefNo: string;
  item: string;
  weightTon: number;
  quantity: number;
  status: DispatchStatus;
  note?: string | null;
};
type ExportOrder = ExportRowSource;

@Injectable()
export class ExportService {
  constructor(private readonly dispatchService: DispatchService) {}

  async exportSingle(id: string): Promise<Buffer> {
    const order = await this.dispatchService.findOne(id);
    const workbook = XLSX.utils.book_new();
    const rows = [EXCEL_HEADERS, this.mapOrderToRow(order)];
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    worksheet['!cols'] = this.getColumnWidths(EXCEL_HEADERS);
    this.applyHeaderStyle(worksheet, EXCEL_HEADERS.length);

    XLSX.utils.book_append_sheet(workbook, worksheet, '배차지시서');
    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }

  async exportList(query: Omit<DispatchQueryDto, 'page' | 'limit'>): Promise<Buffer> {
    const orders = await this.dispatchService.findAllForExport(query);
    const workbook = XLSX.utils.book_new();

    const summaryRows = [
      ['구분', '건수'],
      ['전체', orders.length],
      ['대기', orders.filter((o) => o.status === DispatchStatus.PENDING).length],
      ['진행 중', orders.filter((o) => o.status === DispatchStatus.IN_PROGRESS).length],
      ['완료', orders.filter((o) => o.status === DispatchStatus.COMPLETED).length],
      ['취소', orders.filter((o) => o.status === DispatchStatus.CANCELED).length],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet['!cols'] = [{ wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, '요약');

    const grouped = new Map<string, ExportOrder[]>();
    for (const order of orders) {
      const dateKey = new Date(order.dispatchDate).toISOString().slice(0, 10);
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(order);
    }

    const sortedDates = Array.from(grouped.keys()).sort();
    for (const dateKey of sortedDates) {
      const dateOrders = grouped.get(dateKey) ?? [];
      const rows = dateOrders.map((order) => this.mapOrderToRow(order));
      const worksheet = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS, ...rows]);

      worksheet['!cols'] = this.getColumnWidths(EXCEL_HEADERS);
      this.applyHeaderStyle(worksheet, EXCEL_HEADERS.length);

      XLSX.utils.book_append_sheet(workbook, worksheet, dateKey.slice(0, 31));
    }

    if (sortedDates.length === 0) {
      const emptySheet = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS]);
      XLSX.utils.book_append_sheet(workbook, emptySheet, '데이터없음');
    }

    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }

  private mapOrderToRow(order: ExportRowSource): (string | number)[] {
    const dispatchDate = new Date(order.dispatchDate);

    return [
      dispatchDate ? dispatchDate.toISOString().slice(0, 10) : '',
      order.dispatchNo || '',
      order.origin || '',
      order.destination || '',
      order.orderRefNo || '',
      order.item || '',
      order.weightTon || 0,
      order.quantity || 0,
      STATUS_LABELS[order.status] || '',
      order.note || '',
    ];
  }

  private getColumnWidths(headers: string[]): XLSX.ColInfo[] {
    const widths: Record<string, number> = {
      날짜: 12,
      배차번호: 18,
      출발지: 15,
      도착지: 15,
      수주번호: 18,
      품명: 15,
      '중량(TON)': 12,
      수량: 8,
      상태: 12,
      비고: 30,
    };

    return headers.map((header) => ({ wch: widths[header] || 15 }));
  }

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
