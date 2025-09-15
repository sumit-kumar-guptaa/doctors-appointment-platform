const fs = require('fs');
const path = require('path');

function findAndFixPrismaImports() {
  console.log('🔍 Scanning for Prisma import issues...');
  
  const appDir = path.join(process.cwd(), 'app');
  
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return [];
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files = files.concat(scanDirectory(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const jsFiles = scanDirectory(appDir);
  let fixedCount = 0;
  
  for (const filePath of jsFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if it has problematic import
      if (content.includes("import prisma from '@/lib/prisma'")) {
        console.log(`🔧 Fixing: ${path.relative(process.cwd(), filePath)}`);
        
        let updatedContent = content;
        
        // Fix the import statement
        updatedContent = updatedContent.replace(
          /import prisma from '@\/lib\/prisma';/g,
          "import { db } from '@/lib/prisma';"
        );
        
        // Fix all usage of prisma to db
        updatedContent = updatedContent.replace(/\bprisma\./g, 'db.');
        
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }
  
  console.log(`✅ Fixed ${fixedCount} files`);
  return fixedCount > 0;
}

// Also check if any files import the wrong thing
function verifyImports() {
  console.log('\n🧪 Verifying all imports are correct...');
  
  const appDir = path.join(process.cwd(), 'app');
  
  function checkDirectory(dir) {
    if (!fs.existsSync(dir)) return [];
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let issues = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        issues = issues.concat(checkDirectory(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          if (content.includes("import prisma from '@/lib/prisma'")) {
            issues.push(`❌ ${path.relative(process.cwd(), fullPath)}: still has wrong import`);
          }
          
          if (content.includes('prisma.') && content.includes("from '@/lib/prisma'")) {
            issues.push(`⚠️ ${path.relative(process.cwd(), fullPath)}: may have unreplaced prisma usage`);
          }
        } catch (error) {
          issues.push(`❌ ${path.relative(process.cwd(), fullPath)}: read error - ${error.message}`);
        }
      }
    }
    
    return issues;
  }
  
  const issues = checkDirectory(appDir);
  
  if (issues.length === 0) {
    console.log('✅ All imports look correct!');
  } else {
    console.log('⚠️ Found potential issues:');
    issues.forEach(issue => console.log(issue));
  }
  
  return issues.length === 0;
}

// Run the fixes
console.log('🚀 Starting comprehensive Prisma import fix...\n');

const fixed = findAndFixPrismaImports();
const verified = verifyImports();

if (fixed && verified) {
  console.log('\n🎉 All Prisma imports are now fixed and verified!');
  process.exit(0);
} else if (!fixed) {
  console.log('\n⚠️ No issues found to fix, but build might still fail');
  process.exit(1);
} else {
  console.log('\n❌ Some issues remain after fixing');
  process.exit(1);
}