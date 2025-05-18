
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Download, Plus, Search, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle, 
} from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpensesList } from "@/components/expenses/ExpensesList";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { generatePDF } from "@/utils/pdfUtils";
import { Expense, ExpensesFilterType, expenseCategories } from "@/types/expenses";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { usePIN } from "@/context/PINContext";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [filters, setFilters] = useState<ExpensesFilterType>({
    startDate: undefined,
    endDate: undefined,
    category: undefined,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [reportType, setReportType] = useState<"daily" | "monthly">("daily");
  const { isPINSet, verifyPIN } = usePIN();

  // Fetch expenses from Supabase
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Use typeCasting to avoid TypeScript errors with the expenses table
      const { data, error } = await (supabase as any)
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) throw error;
      
      // Ensure we're setting the correct expense type
      const typedData = data as Expense[];
      setExpenses(typedData || []);
    } catch (error: any) {
      toast.error("Failed to load expenses", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter expenses based on search text and filters
  const filteredExpenses = expenses.filter((expense) => {
    // Search text filter
    const matchesSearch = !searchText || 
      expense.description.toLowerCase().includes(searchText.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchText.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchText.toLowerCase());
    
    // Date range filter
    const expenseDate = new Date(expense.date);
    const matchesDateRange = 
      (!filters.startDate || expenseDate >= filters.startDate) &&
      (!filters.endDate || expenseDate <= filters.endDate);
    
    // Category filter
    const matchesCategory = !filters.category || expense.category === filters.category;
    
    return matchesSearch && matchesDateRange && matchesCategory;
  });

  const handleAddExpense = async (expense: Omit<Expense, "id">) => {
    try {
      // Use typeCasting to avoid TypeScript errors with the expenses table
      const { data, error } = await (supabase as any)
        .from("expenses")
        .insert([expense])
        .select();
      
      if (error) throw error;
      
      // Ensure we're setting the correct expense type
      const typedData = data as Expense[];
      setExpenses([...(typedData || []), ...expenses]);
      setIsAddDialogOpen(false);
      toast.success("Expense added successfully");
    } catch (error: any) {
      toast.error("Failed to add expense", {
        description: error.message
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      category: undefined,
    });
    setSearchText("");
  };

  const handleDownloadReport = async () => {
    try {
      if (isPINSet) {
        const pinVerified = await verifyPIN("Please enter your PIN to download the report");
        if (!pinVerified) {
          toast.error("PIN verification failed");
          return;
        }
      }

      const filename = reportType === "daily" 
        ? `Daily-Expenses-${format(filters.startDate || new Date(), "yyyy-MM-dd")}`
        : `Monthly-Expenses-${format(filters.startDate || new Date(), "yyyy-MM")}`;
      
      await generatePDF(filteredExpenses, filename, reportType);
      toast.success("Report downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate report");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Expenses Management</h1>
          <p className="text-muted-foreground">Track and manage your business expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Expense Filters</CardTitle>
            <CardDescription>Filter expenses by date, category, or text search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center border rounded-md px-3 bg-background">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="border-0 focus-visible:ring-0"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {filters.startDate ? format(filters.startDate, "PP") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => setFilters({ ...filters, startDate: date })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {filters.endDate ? format(filters.endDate, "PP") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => setFilters({ ...filters, endDate: date })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters({ ...filters, category: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="ghost" size="icon" onClick={resetFilters}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Download Report</CardTitle>
            <CardDescription>Export expense data as PDF</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select 
                value={reportType} 
                onValueChange={(value) => setReportType(value as "daily" | "monthly")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                className="w-full"
                onClick={handleDownloadReport}
                disabled={filteredExpenses.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <ExpensesList expenses={filteredExpenses} loading={loading} onRefresh={fetchExpenses} />
        </div>
        <div>
          <ExpenseSummary expenses={filteredExpenses} />
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Enter the details of your new expense.
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm onSubmit={handleAddExpense} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;
