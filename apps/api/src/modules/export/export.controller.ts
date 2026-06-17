import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { ExportService } from './export.service';
import { DispatchQueryDto } from '../dispatch/dto/dispatch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('엑셀 내보내기')
@Controller('dispatch')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * 목록 엑셀 다운로드 (날짜별 시트 분리)
   * GET /dispatch/export/list?status=&dateFrom=&dateTo=...
  */
  @Get('export/list')
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @ApiOperation({
    summary: '배차지시서 목록 엑셀 다운로드 (날짜별 시트 분리)',
    description: '현재 필터 조건이 적용된 전체 목록을 날짜별 시트로 분리한 .xlsx 파일로 다운로드',
  })
  async exportList(
    @Query() query: DispatchQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportList(query);
    const filename = this.buildExportFilename(query);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send(buffer);
  }

  /**
   * 단건 엑셀 다운로드
   * GET /dispatch/:id/export
   */
  @Get(':id/export')
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @ApiOperation({
    summary: '배차지시서 단건 엑셀 다운로드',
    description: '특정 배차지시서를 .xlsx 파일로 다운로드',
  })
  async exportSingle(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportSingle(id);
    const filename = `배차지시서_${id.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send(buffer);
  }

  private buildExportFilename(query: DispatchQueryDto) {
    const today = new Date().toISOString().slice(0, 10);

    if (query.month) {
      return `배차지시서_${query.month}.xlsx`;
    }

    if (query.dateFrom || query.dateTo) {
      const from = query.dateFrom || 'start';
      const to = query.dateTo || 'end';
      return `배차지시서_기간_${from}_${to}.xlsx`;
    }

    return `배차지시서_목록_${today}.xlsx`;
  }
}
