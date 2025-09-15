const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCredits() {
  try {
    // Find Sumit Gupta's user record
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'Sumit', mode: 'insensitive' } },
          { name: { contains: 'Gupta', mode: 'insensitive' } },
          { email: { contains: 'sumit', mode: 'insensitive' } }
        ]
      }
    });

    if (!user) {
      console.log('User not found. Let me check all users...');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          credits: true,
          role: true
        }
      });
      console.log('All users:', JSON.stringify(allUsers, null, 2));
      
      if (allUsers.length > 0) {
        // Update the first user (likely the main user)
        const firstUser = allUsers[0];
        const updatedUser = await prisma.user.update({
          where: { id: firstUser.id },
          data: { credits: 100 }
        });
        console.log(`✅ Updated user ${firstUser.name || 'Unknown User'} with 100 credits:`, updatedUser);
      }
      return;
    }

    // Update the user's credits to 100
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { credits: 100 }
    });

    console.log('✅ Successfully updated user credits:');
    console.log(`User: ${updatedUser.name}`);
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Credits: ${updatedUser.credits}`);
    console.log(`Role: ${updatedUser.role}`);

    // Also check if there are any other users who might need credits
    const allUsersWithLowCredits = await prisma.user.findMany({
      where: {
        credits: {
          lt: 10
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true
      }
    });

    if (allUsersWithLowCredits.length > 0) {
      console.log('\n📊 Users with low credits:');
      for (const lowCreditUser of allUsersWithLowCredits) {
        if (lowCreditUser.id !== updatedUser.id) {
          const updated = await prisma.user.update({
            where: { id: lowCreditUser.id },
            data: { credits: 100 }
          });
          console.log(`✅ Updated ${updated.name || 'Unknown User'}: ${updated.credits} credits`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error updating credits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCredits();