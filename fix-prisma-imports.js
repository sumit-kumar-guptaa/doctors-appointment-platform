const fs = require('fs');
const path = require('path');

// Find all API route files with prisma import issues
const apiRouteFiles = [
  'app/api/emotion-analysis/route.js',
  'app/api/emotion-analysis/alerts/route.js', 
  'app/api/drug-interactions/route.js',
  'app/api/medical-ai-integration/alerts/route.js'
];

function fixPrismaImports() {
  console.log('🔧 Fixing Prisma imports in API routes...');
  
  apiRouteFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return;
    }
    
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix the import statement
      content = content.replace(
        "import prisma from '@/lib/prisma';",
        "import { db } from '@/lib/prisma';"
      );
      
      // Fix all usage of prisma to db
      content = content.replace(/\bprisma\./g, 'db.');
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  });
}

fixPrismaImports();

console.log('\n🎉 All Prisma imports fixed!');