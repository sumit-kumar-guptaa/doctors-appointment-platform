import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    console.log('Dev payment API called');
    
    const { userId } = await auth();
    
    if (!userId) {
      console.log('No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', userId);

    const requestBody = await request.json();
    const { planType, credits, amount, cardDetails, billingInfo } = requestBody;
    
    console.log('Dev payment request:', { planType, credits, amount, userId });
    console.log('Card details received:', !!cardDetails);
    console.log('Billing info received:', !!billingInfo);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple validation for demo
    if (!cardDetails || !cardDetails.number || !cardDetails.exp_month || !cardDetails.exp_year || !cardDetails.cvc) {
      console.log('Invalid card details:', cardDetails);
      return NextResponse.json({ error: 'Invalid card details' }, { status: 400 });
    }

    if (!billingInfo || !billingInfo.name || !billingInfo.email) {
      console.log('Invalid billing info:', billingInfo);
      return NextResponse.json({ error: 'Billing information required' }, { status: 400 });
    }

    // Generate mock transaction ID
    const transactionId = `dev_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const creditsToAdd = parseInt(credits);
    console.log('Credits to add:', creditsToAdd);

    try {
      // Get current user data
      console.log('Getting user data from Clerk...');
      const user = await clerkClient.users.getUser(userId);
      const currentCredits = parseInt(user.privateMetadata?.credits || '0');
      const newCredits = currentCredits + creditsToAdd;
      
      console.log('Current credits:', currentCredits, 'New credits:', newCredits);

      // Update user credits in Clerk
      console.log('Updating user metadata in Clerk...');
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          credits: newCredits.toString()
        }
      });
      
      console.log('Clerk metadata updated successfully');

      // Record transaction in database
      console.log('Recording transaction in database...');
      await prisma.creditTransaction.create({
        data: {
          userId,
          type: 'CREDIT_PURCHASE',
          amount: creditsToAdd,
          description: `Purchased ${creditsToAdd} credits (${planType} plan) - DEV MODE (${transactionId})`,
        }
      });
      
      console.log('Transaction recorded successfully');

      return NextResponse.json({
        success: true,
        message: `Successfully added ${creditsToAdd} credits to your account!`,
        newBalance: newCredits,
        transactionId,
        isDevelopment: true
      });
      
    } catch (serviceError) {
      console.error('Service error (Clerk/Prisma):', serviceError);
      return NextResponse.json(
        { error: `Service error: ${serviceError.message}` }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Dev payment processing error:', error);
    return NextResponse.json(
      { error: `Payment processing failed: ${error.message}` }, 
      { status: 500 }
    );
  }
}