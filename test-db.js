const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Test enum values
    const testQuery = await prisma.$queryRaw`SELECT enum_range(NULL::public."VerificationStatus") as statuses`;
    console.log('✅ Verification statuses:', testQuery);
    
    console.log('🎉 Database is working correctly!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    
    // Suggest solutions
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if your Neon database is active (not suspended)');
    console.log('2. Verify your DATABASE_URL is correct');
    console.log('3. Check your internet connection');
    console.log('4. Try regenerating Neon database credentials');
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();