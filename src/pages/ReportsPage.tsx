
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ComprehensiveReport from "@/components/reports/ComprehensiveReport";

const ReportsPage: React.FC = () => {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Business Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Reports Overview</CardTitle>
              <CardDescription>
                Generate comprehensive business reports that include both sales and expenses data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The comprehensive report provides a complete view of your business performance by combining:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
                <li>Sales summary and transactions</li>
                <li>Payment method breakdown</li>
                <li>Expenses by category</li>
                <li>Profit/loss calculation</li>
                <li>Recent transaction details</li>
              </ul>
              <p className="text-muted-foreground">
                Select a date range and generate the report to get insights into your business performance.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1">
          <ComprehensiveReport />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
