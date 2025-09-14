import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Shield, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Pricing from "@/components/pricing";

export default async function PricingPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      {/* Header Section */}
      <div className="flex justify-start mb-4 sm:mb-6">
        <Link
          href="/"
          className="flex items-center text-muted-foreground hover:text-white transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16 text-center">
        <Badge
          variant="outline"
          className="bg-purple-900/30 border-purple-700/30 px-3 sm:px-4 py-1 sm:py-2 text-orange-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6"
        >
          Affordable Healthcare
        </Badge>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-title mb-4 sm:mb-6 px-4">
          Simple, Transparent Pricing
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
          Choose the perfect consultation package that fits your healthcare
          needs with no hidden fees or long-term commitments
        </p>
      </div>

      {/* Pricing Table Section */}
      <div className="mb-12 sm:mb-16 lg:mb-20">
        <Pricing />
      </div>

      {/* Additional Benefits Section */}
      <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <Card className="bg-purple-950/20 backdrop-blur-sm border-purple-700/30">
            <CardContent className="p-4 sm:p-6 text-center">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-sm sm:text-base text-white mb-2">
                Secure & Private
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                HIPAA compliant platform with end-to-end encryption
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-950/20 backdrop-blur-sm border-purple-700/30">
            <CardContent className="p-4 sm:p-6 text-center">
              <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-orange-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-sm sm:text-base text-white mb-2">
                Flexible Payment
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pay as you go or monthly plans with no long-term contracts
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-950/20 backdrop-blur-sm border-purple-700/30 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6 text-center">
              <Check className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-sm sm:text-base text-white mb-2">
                Money Back Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                30-day money back guarantee on all paid plans
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-4">
          Questions? We're Here to Help
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
          Contact our support team at support@AARAGYA.com
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button variant="outline" className="border-purple-700/30 text-purple-400 hover:bg-purple-950/20">
            View FAQ
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
