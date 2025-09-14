import { db } from "./prisma";

export async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing database connection...");
    
    // Test basic connection
    await db.$connect();
    console.log("✅ Database connection successful");
    
    // Test a simple query
    const result = await db.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database query successful:", result);
    
    return { success: true, message: "Database connection successful" };
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    
    if (error.code === 'P1001') {
      return { 
        success: false, 
        message: "Cannot reach database server. Please check your internet connection and database configuration.",
        error: error.message 
      };
    }
    
    return { 
      success: false, 
      message: "Database connection failed", 
      error: error.message 
    };
  } finally {
    await db.$disconnect();
  }
}