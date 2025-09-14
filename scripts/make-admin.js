const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeUserAdmin() {
  try {
    // First, let's see all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        role: true,
      }
    });

    console.log('📋 Current users in database:');
    console.table(users);

    if (users.length === 0) {
      console.log('❌ No users found in database. Please sign up first, then run this script.');
      return;
    }

    // Get the first user (usually the one who created the account)
    const firstUser = users[0];
    
    console.log(`🔄 Making user ${firstUser.email} (${firstUser.name}) an ADMIN...`);

    // Update the user's role to ADMIN
    const updatedUser = await prisma.user.update({
      where: {
        id: firstUser.id,
      },
      data: {
        role: 'ADMIN',
      },
    });

    console.log('✅ Success! User role updated:');
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log('\n🎉 You can now access the admin panel at http://localhost:3001/admin');
    
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// If you want to make a specific user admin by email, uncomment and use this function instead:
async function makeSpecificUserAdmin(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log('✅ User role updated to ADMIN:', updatedUser.email);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
makeUserAdmin();

// To make a specific user admin by email, uncomment the line below and replace with actual email:
// makeSpecificUserAdmin('your-email@example.com');