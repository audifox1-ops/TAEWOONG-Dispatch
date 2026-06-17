import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { DispatchService } from './dispatch.service';
import {
  CreateDispatchDto,
  UpdateDispatchDto,
  UpdateStatusDto,
  DispatchQueryDto,
} from './dto/dispatch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthUser {
  id: string;
  role: Role;
  name: string;
}

@ApiTags('배차지시서')
@Controller('dispatch')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DISPATCHER, Role.DRIVER)
  @ApiOperation({ summary: '배차지시서 목록 조회 (필터/페이지네이션)' })
  findAll(@Query() query: DispatchQueryDto) {
    return this.dispatchService.findAll(query);
  }

  @Post()
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @ApiOperation({ summary: '배차지시서 생성' })
  create(
    @Body() createDto: CreateDispatchDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.dispatchService.create(createDto, user.id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DISPATCHER, Role.DRIVER)
  @ApiOperation({ summary: '배차지시서 단건 조회' })
  findOne(@Param('id') id: string) {
    return this.dispatchService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @ApiOperation({ summary: '배차지시서 수정' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDispatchDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.dispatchService.update(id, updateDto, user.id, user.role);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '배차지시서 삭제 (소프트 삭제)' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.dispatchService.remove(id, user.id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @ApiOperation({ summary: '배차지시서 상태 변경' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.dispatchService.updateStatus(id, updateStatusDto, user.id);
  }

  @Get(':id/history')
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @ApiOperation({ summary: '배차지시서 변경 이력 조회' })
  getHistory(@Param('id') id: string) {
    return this.dispatchService.getHistory(id);
  }
}
