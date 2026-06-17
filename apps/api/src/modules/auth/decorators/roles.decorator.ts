import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * 역할 기반 접근 제어 데코레이터
 * @example @Roles(Role.ADMIN, Role.DISPATCHER)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
