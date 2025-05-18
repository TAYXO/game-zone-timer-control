
import React, { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, AlertCircle, RotateCw } from "lucide-react";
import { Expense } from "@/types/expenses";
import { ExpenseForm } from "./ExpenseForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePIN } from "@/context/PINContext";

interface ExpensesListProps {
  expenses: Expense[];
  loading: boolean;
  onRefresh: () => void;
}

export const ExpensesList = ({ expenses, loading, onRefresh }: ExpensesListProps) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const { isPINSet, verifyPIN } = usePIN();

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleDelete = async (id: string) => {
    setExpenseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      if (isPINSet) {
        const pinVerified = await verifyPIN("Enter PIN to delete expense");
        if (!pinVerified) {
          toast.error("PIN verification failed");
          setDeleteDialogOpen(false);
          return;
        }
      }

      // Use typeCasting to avoid TypeScript errors with the expenses table
      const { error } = await (supabase as any)
        .from("expenses")
        .delete()
        .match({ id: expenseToDelete });

      if (error) throw error;
      
      toast.success("Expense deleted successfully");
      onRefresh();
    } catch (error: any) {
      toast.error("Failed to delete expense", {
        description: error.message
      });
    } finally {
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleUpdateExpense = async (updatedExpense: Omit<Expense, "id">) => {
    if (!editingExpense) return;

    try {
      // Use typeCasting to avoid TypeScript errors with the expenses table
      const { error } = await (supabase as any)
        .from("expenses")
        .update(updatedExpense)
        .match({ id: editingExpense.id });

      if (error) throw error;
      
      toast.success("Expense updated successfully");
      setEditingExpense(null);
      onRefresh();
    } catch (error: any) {
      toast.error("Failed to update expense", {
        description: error.message
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expenses List</CardTitle>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RotateCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(new Date(expense.date), "PP")}</TableCell>
                      <TableCell>
                        <div className="font-medium">{expense.description}</div>
                        {expense.notes && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {expense.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-secondary">
                          {expense.category}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${expense.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No expenses found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters or add a new expense.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Expense Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Make changes to the expense details.
            </DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <ExpenseForm expense={editingExpense} onSubmit={handleUpdateExpense} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
