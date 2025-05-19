import React, { useState } from "react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, Calendar } from "lucide-react";
import { usePIN } from "@/context/PINContext";
import { usePOS } from "@/context/POSContext";
import { generateComprehensiveReportPDF } from "@/utils/pdfUtils";
import { Expense } from "@/types/expenses";
import { supabase } from "@/integrations/supabase/client";

const ComprehensiveReport: React.FC = () => {
  const { transactions } = usePOS();
  const { isPINSet, verifyPIN } = usePIN();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });
  
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  });
  
  const handleDailyView = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    setStartDate(today);
    setEndDate(endOfDay);
  };
  
  const handleWeeklyView = () => {
    const today = new Date();
    const start = startOfWeek(today);
    const end = endOfWeek(today);
    end.setHours(23, 59, 59, 999);
    
    setStartDate(start);
    setEndDate(end);
  };
  
  const handleMonthlyView = () => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    end.setHours(23, 59, 59, 999);
    
    setStartDate(start);
    setEndDate(end);
  };
  
  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.timestamp);
    return date >= startDate && date <= endDate;
  });
  
  // Calculate sales summary statistics
  const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = filteredTransactions.length;
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  
  // Create data for payment method breakdown
  const paymentMethodData = filteredTransactions.reduce((acc: any[], t) => {
    const existing = acc.find(item => item.name === t.paymentMethod);
    if (existing) {
      existing.amount += t.total;
      existing.count += 1;
    } else {
      acc.push({
        name: t.paymentMethod,
        amount: t.total,
        count: 1
      });
    }
    return acc;
  }, []);

  // Function to fetch expenses from Supabase
  const fetchExpenses = async () => {
    try {
      // Filter expenses by date range
      const { data, error } = await (supabase as any)
        .from("expenses")
        .select("*")
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"))
        .order("date", { ascending: false });
      
      if (error) throw error;
      
      return data as Expense[];
    } catch (error: any) {
      toast({
        title: "Error fetching expenses",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const generateReport = async () => {
    try {
      setIsLoading(true);
      
      // Verify PIN if set
      if (isPINSet) {
        const pinVerified = await verifyPIN("Please enter your PIN to generate the comprehensive report");
        if (!pinVerified) {
          toast({
            title: "PIN verification failed",
            description: "You need to enter the correct PIN to generate reports",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Fetch expenses data
      const expenses = await fetchExpenses();
      
      // Calculate expenses statistics
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      
      // Group expenses by category
      const expensesByCategory: Record<string, number> = {};
      expenses.forEach(expense => {
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += expense.amount;
      });
      
      // Prepare data for the PDF
      const reportData = {
        startDate,
        endDate,
        salesData: {
          totalSales,
          totalTransactions,
          averageTransaction,
          paymentMethodData,
          transactions: filteredTransactions
        },
        expensesData: {
          totalExpenses,
          totalEntries: expenses.length,
          expensesByCategory,
          expenses
        }
      };
      
      // Generate the PDF
      const filename = `comprehensive-report-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}`;
      generateComprehensiveReportPDF(reportData, filename);
      
      toast({
        title: "Report Generated",
        description: "Your comprehensive business report has been generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error generating report",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Comprehensive Business Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Date Range</p>
            </div>
            <div className="flex space-x-2 flex-1">
              <Input
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  date.setHours(0, 0, 0, 0);
                  setStartDate(date);
                }}
              />
              <span className="flex items-center">to</span>
              <Input
                type="date"
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  date.setHours(23, 59, 59, 999);
                  setEndDate(date);
                }}
              />
            </div>
          </div>
          
          <div className="flex space-x-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleDailyView}>Today</Button>
            <Button variant="outline" size="sm" onClick={handleWeeklyView}>This Week</Button>
            <Button variant="outline" size="sm" onClick={handleMonthlyView}>This Month</Button>
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-2">
              This report will combine sales data and expenses for the selected period into a single comprehensive PDF document.
            </p>
            <Button 
              onClick={generateReport} 
              className="w-full"
              disabled={isLoading}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isLoading ? "Generating..." : "Generate Comprehensive Report"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComprehensiveReport;
