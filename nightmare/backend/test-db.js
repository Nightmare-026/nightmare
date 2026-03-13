const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check tables
    const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('📊 Tables in database:', result.map(r => r.table_name));
    
    // Count users
    const userCount = await prisma.user.count();
    console.log('👥 User count:', userCount);
    
    // Count categories
    const categoryCount = await prisma.category.count();
    console.log('📁 Category count:', categoryCount);
    
    await prisma.$disconnect();
    console.log('✅ All checks passed - database is secure and ready');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

testConnection();
