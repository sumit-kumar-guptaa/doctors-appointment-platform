"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

// Define credit allocations per plan
const PLAN_CREDITS = {
  free_user: 0, // Basic plan: 2 credits
  standard: 10, // Standard plan: 10 credits per month
  premium: 24, // Premium plan: 24 credits per month
};

// Each appointment costs 2 credits
const APPOINTMENT_CREDIT_COST = 2;

/**
 * Checks user's subscription and allocates monthly credits if needed
 * This should be called on app initialization (e.g., in a layout component)
 */
export async function checkAndAllocateCredits(user) {
  try {
    if (!user) {
      return null;
    }

    // Only allocate credits for patients
    if (user.role !== "PATIENT") {
      return user;
    }

    // Get current user from Clerk to check metadata
    const { userId } = await auth();
    if (!userId) return user;

    const clerkClient = await import("@clerk/nextjs/server").then(m => m.clerkClient);
    const clerkUser = await clerkClient.users.getUser(userId);
    const currentPlan = clerkUser.publicMetadata?.plan || "free_user";

    let creditsToAllocate = 0;

    // Define credit allocations per plan
    switch (currentPlan) {
      case "premium":
        creditsToAllocate = PLAN_CREDITS.premium;
        break;
      case "standard":
        creditsToAllocate = PLAN_CREDITS.standard;
        break;
      case "free_user":
      default:
        creditsToAllocate = PLAN_CREDITS.free_user;
        break;
    }

    // Check if we already allocated credits for this month
    const currentMonth = format(new Date(), "yyyy-MM");

    // If there's a transaction this month, check if it's for the same plan
    if (user.transactions.length > 0) {
      const latestTransaction = user.transactions[0];
      const transactionMonth = format(
        new Date(latestTransaction.createdAt),
        "yyyy-MM"
      );
      const transactionPlan = latestTransaction.packageId;

      // If we already allocated credits for this month and the plan is the same, just return
      if (
        transactionMonth === currentMonth &&
        transactionPlan === currentPlan
      ) {
        return user;
      }
    }

    // Only allocate credits if plan provides credits (free_user gets 0 monthly credits)
    if (creditsToAllocate === 0) {
      return user;
    }

    // Allocate credits and create transaction record
    const updatedUser = await db.$transaction(async (tx) => {
      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: creditsToAllocate,
          type: "CREDIT_PURCHASE",
          packageId: currentPlan,
          description: `Monthly ${currentPlan} plan credits`,
        },
      });

      // Update user's credit balance
      const updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          credits: {
            increment: creditsToAllocate,
          },
        },
      });

      return updatedUser;
    });

    // Revalidate relevant paths to reflect updated credit balance
    revalidatePath("/doctors");
    revalidatePath("/appointments");

    return updatedUser;
  } catch (error) {
    console.error(
      "Failed to check subscription and allocate credits:",
      error.message
    );
    return user; // Return original user if allocation fails
  }
}

/**
 * Deducts credits for booking an appointment
 */
export async function deductCreditsForAppointment(userId, doctorId) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    const doctor = await db.user.findUnique({
      where: { id: doctorId },
    });

    // Ensure user has sufficient credits
    if (user.credits < APPOINTMENT_CREDIT_COST) {
      throw new Error("Insufficient credits to book an appointment");
    }

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Deduct credits from patient and add to doctor
    const result = await db.$transaction(async (tx) => {
      // Create transaction record for patient (deduction)
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -APPOINTMENT_CREDIT_COST,
          type: "APPOINTMENT_DEDUCTION",
        },
      });

      // Create transaction record for doctor (addition)
      await tx.creditTransaction.create({
        data: {
          userId: doctor.id,
          amount: APPOINTMENT_CREDIT_COST,
          type: "APPOINTMENT_DEDUCTION", // Using same type for consistency
        },
      });

      // Update patient's credit balance (decrement)
      const updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          credits: {
            decrement: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      // Update doctor's credit balance (increment)
      await tx.user.update({
        where: {
          id: doctor.id,
        },
        data: {
          credits: {
            increment: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      return updatedUser;
    });

    return { success: true, user: result };
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    return { success: false, error: error.message };
  }
}
