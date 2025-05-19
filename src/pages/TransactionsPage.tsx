
import React, { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { usePIN } from "@/context/PINContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, FileDown, Download } from "lucide-react";
import { generateTransactionPDF } from "@/utils/pdfUtils";

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const TransactionsPage = () => {
  const { transactions, deleteTransaction } = usePOS();
  const { showPINPrompt } = usePIN();
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState<string>("");
  
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  const filteredTransactions = dateFilter
    ? sortedTransactions.filter(tx => {
        const txDate = new Date(tx.timestamp).toISOString().split('T')[0];
        return txDate === dateFilter;
      })
    : sortedTransactions;

  const handleDeleteTransaction = (id: string) => {
    showPINPrompt(() => {
      deleteTransaction(id);
      toast({
        title: "Transaction Deleted",
        description: "The transaction has been successfully deleted",
      });
    }, "Please enter your PIN to delete this transaction");
  };
  
  const handleDownloadPDF = () => {
    const filename = dateFilter 
      ? `transactions-${dateFilter}` 
      : `transactions-${new Date().toISOString().split('T')[0]}`;
      
    generateTransactionPDF(filteredTransactions, filename);
    
    toast({
      title: "PDF Generated",
      description: "Your transactions have been exported to PDF",
    });
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <label htmlFor="date-filter" className="block text-sm mb-1">
                Filter by Date
              </label>
              <input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            </div>
            
            {dateFilter && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDateFilter("")}
                className="mt-5"
              >
                Clear Filter
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadPDF}
              className="mt-5 ml-auto flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                      <TableCell>
                        {transaction.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            {item.quantity} x {item.product.name}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{transaction.paymentMethod}</span>
                      </TableCell>
                      <TableCell>
                        {transaction.customerName || "Anonymous"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.total)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
