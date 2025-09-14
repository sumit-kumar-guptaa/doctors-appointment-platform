import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

// Validate Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    console.log('Creating payment intent...'); // Debug log
    
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Unauthorized request - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType, credits, amount } = await request.json();
    
    console.log('Payment details:', { planType, credits, amount, userId }); // Debug log

    // Validate input
    if (!planType || !credits || !amount) {
      return NextResponse.json(
        { error: 'Missing required payment details' }, 
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        planType,
        credits: credits.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created:', paymentIntent.id); // Debug log

    const response = {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };

    console.log('Returning response with clientSecret:', !!response.clientSecret); // Debug log

    return NextResponse.json(response);

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' }, 
      { status: 500 }
    );
  }
}