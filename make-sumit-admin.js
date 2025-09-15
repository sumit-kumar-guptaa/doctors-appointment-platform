const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeSumitAdmin() {
  try {
    console.log('🔍 Looking for Sumit Gupta in the database...');
    
    // Search for Sumit Gupta by name variations
    const searchPatterns = [
      'sumit gupta',
      'sumit guptaa', 
      'sumit kumar gupta',
      'sumitguptaa',
      'sumit'
    ];
    
    let user = null;
    
    for (const pattern of searchPatterns) {
      console.log(`   Searching for: "${pattern}"`);
      const foundUsers = await prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: pattern,
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: pattern,
                mode: 'insensitive'
              }
            }
          ]
        }
      });
      
      if (foundUsers.length > 0) {
        user = foundUsers[0]; // Take the first match
        console.log(`   ✅ Found user: ${user.name} (${user.email})`);
        break;
      }
    }
    
    if (!user) {
      console.log('❌ Sumit Gupta not found in database');
      console.log('📋 Let me show you all users in the database:');
      
      const allUsers = await prisma.user.findMany({
        select: {
          name: true,
          email: true,
          role: true,
          clerkUserId: true
        }
      });
      
      if (allUsers.length === 0) {
        console.log('   No users found in database');
      } else {
        allUsers.forEach((u, index) => {
          console.log(`   ${index + 1}. ${u.name || 'No name'} (${u.email}) - ${u.role}`);
        });
      }
      
      return;
    }
    
    console.log(`\n👤 Current user details:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Verification Status: ${user.verificationStatus}`);
    
    if (user.role === 'ADMIN') {
      console.log('✅ User is already an ADMIN!');
      return;
    }
    
    console.log('\n🚀 Updating user to ADMIN role...');
    
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        role: 'ADMIN',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: 'System Admin'
      }
    });
    
    console.log('✅ Successfully updated user to ADMIN!');
    console.log(`\n🎯 Updated user details:`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Verification Status: ${updatedUser.verificationStatus}`);
    console.log(`   Verified At: ${updatedUser.verifiedAt}`);
    
    console.log('\n🔐 Admin Privileges Granted:');
    console.log('   ✅ Access to Admin Dashboard');
    console.log('   ✅ Verify/Reject Doctor Applications');
    console.log('   ✅ Manage User Accounts');
    console.log('   ✅ View Platform Analytics');
    console.log('   ✅ Manage Payments and Payouts');
    console.log('   ✅ System Configuration Access');
    
    console.log('\n🎉 Sumit Gupta is now an ADMIN and can verify doctors!');
    
  } catch (error) {
    console.error('❌ Error making Sumit admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeSumitAdmin();