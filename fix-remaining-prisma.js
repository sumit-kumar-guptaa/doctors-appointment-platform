const fs = require('fs');
const path = require('path');

const problemFiles = [
  'app/api/emergency/route.js',
  'app/api/emergency-call/route.js', 
  'app/api/kyc/route.js',
  'app/api/vonage-video/route.js',
  'app/api/webhooks/stripe/route.js'
];

console.log('🔧 Fixing remaining Prisma usage issues...');

problemFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    
    // Fix import patterns
    if (content.includes("import { db as prisma } from '@/lib/prisma'")) {
      content = content.replace(
        "import { db as prisma } from '@/lib/prisma'",
        "import { db } from '@/lib/prisma'"
      );
      changed = true;
    }
    
    if (content.includes("import prisma from '@/lib/prisma'")) {
      content = content.replace(
        "import prisma from '@/lib/prisma'",
        "import { db } from '@/lib/prisma'"
      );
      changed = true;
    }
    
    // Fix usage
    if (content.includes('prisma.')) {
      content = content.replace(/\bprisma\./g, 'db.');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`✓ No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log('\n🎉 All remaining Prisma issues fixed!');