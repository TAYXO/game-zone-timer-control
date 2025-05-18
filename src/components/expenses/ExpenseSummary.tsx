
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/types/expenses";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export const ExpenseSummary = ({ expenses }: ExpenseSummaryProps) => {
  // Calculate total expenses
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  
  // Calculate expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const { category, amount } = expense;
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort categories by amount (descending)
  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, amountA], [, amountB]) => amountB - amountA);

  // Calculate recent expenses (last 7 days)
  const now = new Date();
  const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
  const recentExpenses = expenses.filter(expense => new Date(expense.date) >= oneWeekAgo);
  const recentTotal = recentExpenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="text-xl font-bold">${totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last 7 Days</span>
              <span className="font-medium">${recentTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Number of Entries</span>
              <span className="font-medium">{expenses.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>By Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedCategories.length > 0 ? (
              sortedCategories.map(([category, amount], index) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{category}</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(amount / totalExpenses) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No data to display</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
