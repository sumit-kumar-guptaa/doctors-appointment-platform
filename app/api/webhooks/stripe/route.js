import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/prisma';

// Validate Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const headersList = headers();
  const sig = headersList.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      try {
        const { userId, planType, credits } = paymentIntent.metadata;
        const creditsToAdd = parseInt(credits);

        if (userId && creditsToAdd) {
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
              description: `Purchased ${creditsToAdd} credits (${planType} plan) (${paymentIntent.id})`,
            }
          });

          console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
        }
      } catch (error) {
        console.error('Error processing payment:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}