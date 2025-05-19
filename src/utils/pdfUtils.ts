import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { Expense } from "@/types/expenses";
import { Transaction } from "@/types/pos";

export const generatePDF = async (
  expenses: Expense[],
  filename: string,
  reportType: "daily" | "monthly"
): Promise<void> => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  const title = reportType === "daily" ? "Daily Expenses Report" : "Monthly Expenses Report";
  const dateStr = format(new Date(), "MMMM dd, yyyy");
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  
  // Add report generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${dateStr}`, 14, 30);
  
  // Add period text based on report type
  if (expenses.length > 0) {
    let periodText;
    if (reportType === "daily") {
      periodText = `For: ${format(new Date(expenses[0].date), "MMMM dd, yyyy")}`;
    } else {
      periodText = `For: ${format(new Date(expenses[0].date), "MMMM yyyy")}`;
    }
    doc.text(periodText, 14, 36);
  }
  
  // Add summary information
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  doc.setFontSize(12);
  doc.text(`Total Expenses: $${totalAmount.toFixed(2)}`, 14, 46);
  doc.text(`Number of Entries: ${expenses.length}`, 14, 52);
  
  // Calculate expenses by category
  const categories: Record<string, number> = {};
  expenses.forEach(expense => {
    if (!categories[expense.category]) {
      categories[expense.category] = 0;
    }
    categories[expense.category] += expense.amount;
  });
  
  // Create expense table data
  const tableData = expenses.map(expense => [
    format(new Date(expense.date), "MM/dd/yyyy"),
    expense.description,
    expense.category,
    `$${expense.amount.toFixed(2)}`,
    expense.notes || ""
  ]);
  
  // Add expense table
  autoTable(doc, {
    startY: 60,
    head: [["Date", "Description", "Category", "Amount", "Notes"]],
    body: tableData,
    headStyles: {
      fillColor: [38, 9, 94], // Dark purple
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 245]
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 50 }, // Description
      2: { cellWidth: 30 }, // Category
      3: { cellWidth: 25 }, // Amount
      4: { cellWidth: 60 } // Notes
    },
    margin: { top: 60 }
  });
  
  // Add category breakdown table
  const categoryTableY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text("Expenses by Category", 14, categoryTableY);
  
  const categoryTableData = Object.entries(categories)
    .sort((a, b) => b[1] - a[1]) // Sort by amount (descending)
    .map(([category, amount]) => [category, `$${amount.toFixed(2)}`, `${((amount / totalAmount) * 100).toFixed(2)}%`]);
  
  autoTable(doc, {
    startY: categoryTableY + 10,
    head: [["Category", "Amount", "Percentage"]],
    body: categoryTableData,
    headStyles: {
      fillColor: [38, 9, 94], // Dark purple
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 245]
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`GameZone - Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
    doc.text(`Generated using GameZone Expense Manager`, doc.internal.pageSize.width - 90, doc.internal.pageSize.height - 10);
  }
  
  // Save or open the PDF
  doc.save(`${filename}.pdf`);
};

export const generateTransactionPDF = (
  transactions: Transaction[],
  filename: string
): void => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  const title = "Transaction Report";
  const dateStr = format(new Date(), "MMMM dd, yyyy");
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  
  // Add report generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${dateStr}`, 14, 30);
  
  // Add period text if filtered
  if (transactions.length > 0) {
    const oldestTransaction = new Date(Math.min(...transactions.map(t => new Date(t.timestamp).getTime())));
    const newestTransaction = new Date(Math.max(...transactions.map(t => new Date(t.timestamp).getTime())));
    
    const periodText = `Period: ${format(oldestTransaction, "MM/dd/yyyy")} - ${format(newestTransaction, "MM/dd/yyyy")}`;
    doc.text(periodText, 14, 36);
  }
  
  // Add summary information
  const totalAmount = transactions.reduce((sum, t) => sum + t.total, 0);
  doc.setFontSize(12);
  doc.text(`Total Sales: $${totalAmount.toFixed(2)}`, 14, 46);
  doc.text(`Number of Transactions: ${transactions.length}`, 14, 52);
  
  // Create transaction table data
  const tableData = transactions.map(transaction => [
    format(new Date(transaction.timestamp), "MM/dd/yyyy HH:mm"),
    transaction.items.map(item => `${item.quantity}x ${item.product.name}`).join(", "),
    transaction.paymentMethod,
    transaction.customerName || "Anonymous",
    `$${transaction.total.toFixed(2)}`
  ]);
  
  // Add transaction table
  autoTable(doc, {
    startY: 60,
    head: [["Date & Time", "Items", "Payment", "Customer", "Total"]],
    body: tableData,
    headStyles: {
      fillColor: [38, 9, 94], // Dark purple
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 245]
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Date
      1: { cellWidth: 60 }, // Items
      2: { cellWidth: 25 }, // Payment
      3: { cellWidth: 30 }, // Customer
      4: { cellWidth: 25 } // Total
    },
    margin: { top: 60 }
  });
  
  // Add payment method breakdown
  const paymentMethods: Record<string, number> = {};
  transactions.forEach(t => {
    if (!paymentMethods[t.paymentMethod]) {
      paymentMethods[t.paymentMethod] = 0;
    }
    paymentMethods[t.paymentMethod] += t.total;
  });
  
  // Get Y position after the transaction table
  const paymentTableY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text("Payment Method Breakdown", 14, paymentTableY);
  
  const paymentTableData = Object.entries(paymentMethods)
    .sort((a, b) => b[1] - a[1])
    .map(([method, amount]) => [
      method,
      `$${amount.toFixed(2)}`,
      `${((amount / totalAmount) * 100).toFixed(2)}%`
    ]);
  
  autoTable(doc, {
    startY: paymentTableY + 10,
    head: [["Payment Method", "Amount", "Percentage"]],
    body: paymentTableData,
    headStyles: {
      fillColor: [38, 9, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`GameZone - Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
    doc.text(`Generated on ${dateStr}`, doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};

export const generateSalesSummaryPDF = (
  summaryData: {
    startDate: Date;
    endDate: Date;
    totalSales: number;
    totalTransactions: number;
    averageTransaction: number;
    deviceHoursData: Array<{name: string; hours: number; revenue: number}>;
    paymentMethodData: Array<{name: string; amount: number; count: number}>;
    transactions: Transaction[];
  },
  filename: string
): void => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  const title = "Sales Summary Report";
  const dateRange = `${format(summaryData.startDate, "MMMM dd, yyyy")} - ${format(summaryData.endDate, "MMMM dd, yyyy")}`;
  
  // Add title and date range
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Period: ${dateRange}`, 14, 30);
  doc.text(`Generated on: ${format(new Date(), "MMMM dd, yyyy")}`, 14, 36);
  
  // Add summary metrics
  doc.setFontSize(14);
  doc.text("Summary Metrics", 14, 46);
  
  doc.setFontSize(12);
  doc.text(`Total Sales: $${summaryData.totalSales.toFixed(2)}`, 20, 56);
  doc.text(`Number of Transactions: ${summaryData.totalTransactions}`, 20, 62);
  doc.text(`Average Transaction: $${summaryData.averageTransaction.toFixed(2)}`, 20, 68);
  
  // Add device usage table
  doc.setFontSize(14);
  doc.text("Device Usage & Revenue", 14, 78);
  
  const deviceTableData = summaryData.deviceHoursData.map(device => [
    device.name,
    `${device.hours.toFixed(2)} hours`,
    `$${device.revenue.toFixed(2)}`
  ]);
  
  autoTable(doc, {
    startY: 82,
    head: [["Device", "Hours Used", "Revenue"]],
    body: deviceTableData,
    headStyles: {
      fillColor: [38, 9, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    }
  });
  
  // Add payment method breakdown
  const paymentY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text("Payment Method Breakdown", 14, paymentY);
  
  const paymentTableData = summaryData.paymentMethodData.map(method => [
    method.name,
    `$${method.amount.toFixed(2)}`,
    `${method.count}`,
    `$${(method.amount / method.count).toFixed(2)}`
  ]);
  
  autoTable(doc, {
    startY: paymentY + 4,
    head: [["Method", "Total Amount", "Count", "Avg per Transaction"]],
    body: paymentTableData,
    headStyles: {
      fillColor: [38, 9, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    }
  });
  
  // Add transaction list (top 10 if too many)
  const transactionsY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  const transactionsTitle = summaryData.transactions.length > 10 
    ? "Recent Transactions (Top 10)" 
    : "Recent Transactions";
  doc.text(transactionsTitle, 14, transactionsY);
  
  const transactionTableData = summaryData.transactions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
    .map(t => [
      format(new Date(t.timestamp), "MM/dd/yyyy HH:mm"),
      t.items.map(item => `${item.quantity}x ${item.product.name.substring(0, 15)}`).join(", ").substring(0, 30),
      t.paymentMethod,
      `$${t.total.toFixed(2)}`
    ]);
  
  autoTable(doc, {
    startY: transactionsY + 4,
    head: [["Date & Time", "Items", "Payment Method", "Total"]],
    body: transactionTableData,
    headStyles: {
      fillColor: [38, 9, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`GameZone - Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
    doc.text(`Generated on ${format(new Date(), "MMM dd, yyyy HH:mm")}`, doc.internal.pageSize.width - 90, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};

// New function to generate a comprehensive report
export const generateComprehensiveReportPDF = (
  reportData: {
    startDate: Date;
    endDate: Date;
    salesData: {
      totalSales: number;
      totalTransactions: number;
      averageTransaction: number;
      paymentMethodData: Array<{name: string; amount: number; count: number}>;
      transactions: Transaction[];
    },
    expensesData: {
      totalExpenses: number;
      totalEntries: number;
      expensesByCategory: Record<string, number>;
      expenses: Expense[];
    }
  },
  filename: string
): void => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  const title = "GameZone Comprehensive Business Report";
  const dateStr = format(new Date(), "MMMM dd, yyyy");
  const dateRange = `${format(reportData.startDate, "MMMM dd, yyyy")} - ${format(reportData.endDate, "MMMM dd, yyyy")}`;
  
  // Add title and header information
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Report Period: ${dateRange}`, 14, 30);
  doc.text(`Generated on: ${dateStr}`, 14, 36);
  
  // Add financial overview section
  doc.setFontSize(16);
  doc.text("Financial Overview", 14, 46);
  
  // Calculate profit/loss
  const totalSales = reportData.salesData.totalSales;
  const totalExpenses = reportData.expensesData.totalExpenses;
  const profitLoss = totalSales - totalExpenses;
  const profitMargin = totalSales > 0 ? (profitLoss / totalSales) * 100 : 0;
  
  // Add key metrics
  doc.setFontSize(12);
  doc.text(`Total Revenue: $${totalSales.toFixed(2)}`, 20, 56);
  doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 20, 62);
  doc.text(`Net Profit/Loss: $${profitLoss.toFixed(2)}`, 20, 68);
  doc.text(`Profit Margin: ${profitMargin.toFixed(2)}%`, 20, 74);
  doc.text(`Total Transactions: ${reportData.salesData.totalTransactions}`, 20, 80);
  doc.text(`Average Transaction: $${reportData.salesData.averageTransaction.toFixed(2)}`, 20, 86);
  
  // Add sales breakdown section
  doc.setFontSize(16);
  doc.text("Sales Breakdown", 14, 100);
  
  // Payment method breakdown table
  const paymentTableData = reportData.salesData.paymentMethodData.map(method => [
    method.name,
    `$${method.amount.toFixed(2)}`,
    `${method.count}`,
    `$${(method.amount / method.count).toFixed(2)}`
  ]);
  
  autoTable(doc, {
    startY: 104,
    head: [["Payment Method", "Total Amount", "Count", "Avg per Transaction"]],
    body: paymentTableData,
    headStyles: {
      fillColor: [38, 9, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    }
  });
  
  // Add expenses breakdown section
  const expensesY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(16);
  doc.text("Expenses Breakdown", 14, expensesY);
  
  // Category breakdown table
  const categoryData = Object.entries(reportData.expensesData.expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => [
      category,
      `$${amount.toFixed(2)}`,
      `${((amount / totalExpenses) * 100).toFixed(2)}%`
    ]);
  
  autoTable(doc, {
    startY: expensesY + 4,
    head: [["Category", "Amount", "Percentage"]],
    body: categoryData,
    headStyles: {
      fillColor: [38, 9, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    }
  });
  
  // Recent transactions section
  const transactionsY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  const transactionsTitle = "Recent Sales Transactions (Top 5)";
  doc.text(transactionsTitle, 14, transactionsY);
  
  const transactionTableData = reportData.salesData.transactions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
    .map(t => [
      format(new Date(t.timestamp), "MM/dd/yyyy"),
      t.items.map(item => `${item.quantity}x ${item.product.name.substring(0, 15)}`).join(", ").substring(0, 30),
      t.paymentMethod,
      `$${t.total.toFixed(2)}`
    ]);
  
  autoTable(doc, {
    startY: transactionsY + 4,
    head: [["Date", "Items", "Payment", "Total"]],
    body: transactionTableData,
    headStyles: {
      fillColor: [38, 9, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    }
  });
  
  // Recent expenses section
  const expensesListY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  const expensesTitle = "Recent Expenses (Top 5)";
  doc.text(expensesTitle, 14, expensesListY);
  
  const expensesTableData = reportData.expensesData.expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(e => [
      format(new Date(e.date), "MM/dd/yyyy"),
      e.description,
      e.category,
      `$${e.amount.toFixed(2)}`
    ]);
  
  autoTable(doc, {
    startY: expensesListY + 4,
    head: [["Date", "Description", "Category", "Amount"]],
    body: expensesTableData,
    headStyles: {
      fillColor: [38, 9, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`GameZone - Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
    doc.text(`Generated on ${dateStr}`, doc.internal.pageSize.width - 90, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};
