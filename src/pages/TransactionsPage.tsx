
import React, { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { Transaction } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const TransactionsPage: React.FC = () => {
  const { transactions } = usePOS();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Filter transactions based on search and date
  const filteredTransactions = transactions.filter(transaction => {
    const formattedDate = format(transaction.timestamp, "yyyy-MM-dd");
    const matchesDate = !dateFilter || formattedDate === dateFilter;

    // Check if any product in the transaction matches the search query
    const matchesSearch = !searchQuery || transaction.items.some(item => 
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return matchesDate && matchesSearch;
  });

  // Sort transactions by timestamp (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Transaction History</h1>
      
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>
      
      {sortedTransactions.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(transaction.timestamp, "MMM dd, yyyy")}</TableCell>
                  <TableCell>{format(transaction.timestamp, "h:mm a")}</TableCell>
                  <TableCell>${transaction.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="capitalize">{transaction.paymentMethod}</span>
                  </TableCell>
                  <TableCell>{transaction.items.reduce((sum, item) => sum + item.quantity, 0)} items</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <p className="text-muted-foreground">No transactions found</p>
        </div>
      )}
      
      {selectedTransaction && (
        <Dialog open={true} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Date & Time:</div>
                <div>{format(selectedTransaction.timestamp, "MMM dd, yyyy h:mm a")}</div>
                
                <div className="text-muted-foreground">Payment Method:</div>
                <div className="capitalize">{selectedTransaction.paymentMethod}</div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Items:</h3>
                <div className="space-y-2">
                  {selectedTransaction.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm border-b pb-2">
                      <div>
                        {item.quantity} x {item.product.name}
                      </div>
                      <div>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between font-bold border-t pt-4">
                <div>Total:</div>
                <div>${selectedTransaction.total.toFixed(2)}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TransactionsPage;
