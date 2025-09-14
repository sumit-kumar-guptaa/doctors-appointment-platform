'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CheckCircle, CreditCard, ArrowRight } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const paymentIntentId = searchParams.get('payment_intent') || searchParams.get('transaction_id');
  const credits = searchParams.get('credits');
  const planType = searchParams.get('plan');
  const isDev = searchParams.get('dev') === 'true';

  useEffect(() => {
    if (paymentIntentId && credits && planType) {
      setPaymentDetails({
        paymentIntentId,
        credits: parseInt(credits),
        planType
      });
    }
    setLoading(false);
  }, [paymentIntentId, credits, planType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-t-lg text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 rounded-full p-4">
                <CheckCircle className="h-16 w-16 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              Payment Successful!
            </CardTitle>
            <p className="text-green-100 text-lg">
              Your credits have been added to your account
            </p>
            {isDev && (
              <div className="mt-4">
                <Badge className="bg-yellow-500 text-yellow-900 px-3 py-1">
                  Development Mode
                </Badge>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-8">
            {paymentDetails ? (
              <div className="space-y-6">
                {/* Payment Summary */}
                <div className="bg-gradient-to-r from-purple-100 to-orange-100 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                    Payment Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Plan Purchased</p>
                      <p className="font-semibold text-gray-800">{paymentDetails.planType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Credits Added</p>
                      <p className="font-semibold text-purple-600 text-lg">
                        {paymentDetails.credits} Credits
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-mono text-xs text-gray-500">
                        {paymentDetails.paymentIntentId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Completed
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Current Balance */}
                {user?.privateMetadata?.credits && (
                  <div className="bg-gradient-to-r from-orange-100 to-purple-100 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Your Current Balance
                    </h3>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">
                      {user.privateMetadata.credits} Credits
                    </div>
                    <p className="text-gray-600 mt-2">
                      Ready to use for consultations
                    </p>
                  </div>
                )}

                {/* Next Steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    What's Next?
                  </h3>
                  <ul className="space-y-2 text-blue-700">
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Browse our verified doctors
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Schedule your consultation
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Join your video call at the scheduled time
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button asChild className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white">
                    <Link href="/doctors">
                      Browse Doctors
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/appointments">
                      My Appointments
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  No payment details found. Please check your account for updates.
                </p>
                <Button asChild>
                  <Link href="/pricing">
                    Back to Pricing
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}