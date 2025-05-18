
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export type ExpensesFilterType = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  category: string | undefined;
}

export const expenseCategories = [
  "Food",
  "Supplies",
  "Equipment",
  "Maintenance",
  "Utilities",
  "Rent",
  "Salaries",
  "Marketing",
  "Other"
];
