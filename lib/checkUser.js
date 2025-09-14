import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
      include: {
        transactions: {
          where: {
            type: "CREDIT_PURCHASE",
            // Only get transactions from current month
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (loggedInUser) {
      console.log("✅ Found existing user:", loggedInUser.id);
      return loggedInUser;
    }

    console.log("🔄 Creating new user for Clerk ID:", user.id);
    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        transactions: {
          create: {
            type: "CREDIT_PURCHASE",
            packageId: "free_user",
            amount: 0,
            description: "Welcome bonus - Free user credits",
          },
        },
      },
    });

    console.log("✅ Created new user:", newUser.id);
    return newUser;
  } catch (error) {
    console.error("❌ Error in checkUser:", error);
    console.error("Error details:", error.message);
    throw error; // Re-throw the error so the calling function can handle it
  }
};
