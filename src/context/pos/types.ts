
import { Product, CartItem, Transaction, PaymentMethod } from "@/types/pos";

export interface POSContextType {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, "id">) => Promise<Product | undefined>;
  editProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  updateCartItemDetails: (productId: string, details: { price: number; duration?: number }) => void;
  clearCart: () => void;
  processTransaction: (paymentMethod: PaymentMethod, customerName?: string) => void;
  getTransactionsByDate: (date: Date) => Transaction[];
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  getTotalSalesByDevice: (deviceId?: string) => number;
  getTotalHoursByDevice: (deviceId?: string) => number;
  loading: boolean;
}
