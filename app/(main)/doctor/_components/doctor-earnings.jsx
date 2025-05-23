"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar, BarChart3 } from "lucide-react";

export function DoctorEarnings({ earnings }) {
  const {
    totalEarnings = 0,
    thisMonthEarnings = 0,
    completedAppointments = 0,
    averageEarningsPerMonth = 0,
  } = earnings;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-emerald-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-3xl font-bold text-white">
                ${totalEarnings.toFixed(2)}
              </p>
            </div>
            <div className="bg-emerald-900/20 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-3xl font-bold text-white">
                ${thisMonthEarnings.toFixed(2)}
              </p>
            </div>
            <div className="bg-emerald-900/20 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Appointments
              </p>
              <p className="text-3xl font-bold text-white">
                {completedAppointments}
              </p>
              <p className="text-xs text-muted-foreground">completed</p>
            </div>
            <div className="bg-emerald-900/20 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg/Month</p>
              <p className="text-3xl font-bold text-white">
                ${averageEarningsPerMonth.toFixed(2)}
              </p>
            </div>
            <div className="bg-emerald-900/20 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
