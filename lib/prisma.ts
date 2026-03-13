import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // During build time, DATABASE_URL might be missing for some static pages
    // if not correctly provided. We return a client without adapter or with a dummy
    // but Prisma 7 will fail if it tries to connect.
    // However, for Next.js build, we need to handle this.
    return new PrismaClient();
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
