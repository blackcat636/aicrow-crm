"use client"

export const runtime = 'edge';

import { AdminBalanceDeposit } from '@/components/admin/admin-balance-deposit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconCoins, IconShield, IconAlertTriangle } from '@tabler/icons-react';

export default function AdminBalanceDepositPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 px-6 pb-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <IconCoins className="h-8 w-8 text-primary" />
            Administrative Balance Deposit
          </h1>
          <p className="text-muted-foreground">
            Deposit balance to any user with full operation audit
          </p>
        </div>

        {/* Security Notice */}
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <IconShield className="h-5 w-5" />
              Important Security Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-orange-600 dark:text-orange-400">
            <div className="flex items-start gap-2">
              <IconAlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                All balance deposit operations are logged in audit with administrator information
              </p>
            </div>
            <div className="flex items-start gap-2">
              <IconCoins className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Each transaction has a unique ID and is stored in operation history
              </p>
            </div>
            <div className="flex items-start gap-2">
              <IconCoins className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Maximum deposit amount: 1,000,000 • Precision: up to 8 decimal places
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <AdminBalanceDeposit />
      </div>
    </div>
  );
}
