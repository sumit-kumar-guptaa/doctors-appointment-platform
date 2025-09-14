import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentIntentId } = await request.json();

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const { planType, credits } = paymentIntent.metadata;
      const creditsToAdd = parseInt(credits);

      // Get current user data
      const user = await clerkClient.users.getUser(userId);
      const currentCredits = parseInt(user.privateMetadata?.credits || '0');
      const newCredits = currentCredits + creditsToAdd;

      // Update user credits in Clerk
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          credits: newCredits.toString()
        }
      });

      // Record transaction in database
      await prisma.creditTransaction.create({
        data: {
          userId,
          type: 'CREDIT_PURCHASE',
          amount: creditsToAdd,
          description: `Purchased ${creditsToAdd} credits (${planType} plan) (${paymentIntentId})`,
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: `Successfully added ${creditsToAdd} credits to your account!`,
        newBalance: newCredits
      });

    } else {
      return NextResponse.json(
        { error: 'Payment not completed' }, 
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' }, 
      { status: 500 }
    );
  }
}