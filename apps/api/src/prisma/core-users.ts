import * as bcrypt from 'bcrypt';
import { Role, type PrismaClient } from '@prisma/client';

const BCRYPT_ROUNDS = 12;

type CoreUserInput = {
  loginId: string;
  name: string;
  password: string;
  role: Role;
  phone: string;
};

const CORE_USERS: CoreUserInput[] = [
  {
    loginId: 'admin',
    name: '시스템 관리자',
    password: 'Admin1234!',
    role: Role.ADMIN,
    phone: '010-0000-0000',
  },
  {
    loginId: 'dispatcher1',
    name: '배차담당1',
    password: 'Disp1234!',
    role: Role.DISPATCHER,
    phone: '010-1111-2222',
  },
  {
    loginId: 'dispatcher2',
    name: '배차담당2',
    password: 'Disp1234!',
    role: Role.DISPATCHER,
    phone: '010-3333-4444',
  },
];

export async function ensureCoreUsers(prisma: Pick<PrismaClient, 'user'>) {
  const hashes = new Map<string, string>();

  for (const user of CORE_USERS) {
    const passwordHash = hashes.get(user.password) ?? (await bcrypt.hash(user.password, BCRYPT_ROUNDS));
    hashes.set(user.password, passwordHash);

    await prisma.user.upsert({
      where: { loginId: user.loginId },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
        phone: user.phone,
        isActive: true,
      },
      create: {
        loginId: user.loginId,
        name: user.name,
        passwordHash,
        role: user.role,
        phone: user.phone,
        isActive: true,
      },
    });
  }
}
