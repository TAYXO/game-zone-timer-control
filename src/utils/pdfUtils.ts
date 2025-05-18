
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { Expense } from "@/types/expenses";

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
