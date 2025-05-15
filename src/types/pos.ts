
export type PaymentMethod = 'cash' | 'card' | 'mobile';

export type ProductCategory = 'gameTime' | 'merchandise' | 'food' | 'drink';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
  description?: string;
  stock?: number;
  deviceId?: string;  // For linking to specific devices
  duration?: number;  // Duration in minutes for gameTime products
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: Date;
  deviceId?: string;  // Optional: if the sale is related to a specific device
  customerName?: string; // Optional: customer name
}

// For reports and analytics
export interface SalesSummary {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  salesByCategory: {
    [key in ProductCategory]?: number;
  };
  salesByPaymentMethod: {
    [key in PaymentMethod]?: number;
  };
}
