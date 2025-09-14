import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log("❌ No userId found in auth");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("✅ User authenticated:", userId);

    const body = await request.json();
    const { plan } = body;

    console.log("📝 Received plan:", plan);

    // Validate plan
    const validPlans = ["free_user", "standard", "premium"];
    if (!validPlans.includes(plan)) {
      console.log("❌ Invalid plan:", plan);
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      console.log("❌ User not found in database:", userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("✅ User found in database:", user.email);

    // Credit allocations per plan
    const planCredits = {
      free_user: 2,
      standard: 10,
      premium: 24,
    };

    const creditsToAdd = planCredits[plan];
    console.log("💳 Credits to add:", creditsToAdd);

    try {
      // Update user's subscription in Clerk
      console.log("🔄 Updating Clerk metadata...");
      await clerkClient().users.updateUserMetadata(userId, {
        publicMetadata: {
          plan: plan,
          subscriptionDate: new Date().toISOString(),
        }
      });
      console.log("✅ Clerk metadata updated");
    } catch (clerkError) {
      console.error("❌ Clerk error:", clerkError);
      // Continue even if Clerk update fails
    }

    // Update user credits and create transaction record
    console.log("🔄 Updating database...");
    
    const result = await db.$transaction(async (tx) => {
      try {
        console.log("📝 Creating transaction record...");
        // Create transaction record
        const transaction = await tx.creditTransaction.create({
          data: {
            userId: user.id,
            amount: creditsToAdd,
            type: "CREDIT_PURCHASE",
            packageId: plan,
            description: `${plan} plan subscription - ${creditsToAdd} credits`,
          },
        });
        console.log("✅ Transaction record created:", transaction.id);

        console.log("💰 Updating user credits...");
        // Update user's credit balance
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            credits: { increment: creditsToAdd },
          },
          select: {
            id: true,
            credits: true,
            name: true,
            email: true,
          }
        });
        console.log("✅ User credits updated. New balance:", updatedUser.credits);

        return updatedUser;
      } catch (txError) {
        console.error("❌ Transaction error:", txError);
        throw txError;
      }
    }, {
      maxWait: 5000, // default: 2000
      timeout: 10000, // default: 5000
    });

    console.log("✅ Database updated successfully");
    console.log("🎉 Subscription completed for:", result.email);

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to ${plan} plan!`,
      user: result,
      creditsAdded: creditsToAdd,
    });

  } catch (error) {
    console.error("❌ Subscription error details:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json(
      { 
        error: "Failed to process subscription",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check current subscription
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user metadata from Clerk
    const clerkUser = await clerkClient().users.getUser(userId);
    const currentPlan = clerkUser.publicMetadata?.plan || "free_user";
    const subscriptionDate = clerkUser.publicMetadata?.subscriptionDate;

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        credits: true,
        name: true,
        email: true,
      }
    });

    return NextResponse.json({
      success: true,
      currentPlan,
      subscriptionDate,
      user,
    });

  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription info" },
      { status: 500 }
    );
  }
}