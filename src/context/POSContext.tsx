
import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, Transaction, PaymentMethod } from "@/types/pos";
import { generateId } from "@/utils/gameUtils";
import { useToast } from "@/components/ui/use-toast";

interface POSContextType {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, "id">) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  processTransaction: (paymentMethod: PaymentMethod) => void;
}

export const POSContext = createContext<POSContextType | undefined>(undefined);

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
};

export const POSProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem("posProducts");
    return savedProducts ? JSON.parse(savedProducts) : getSampleProducts();
  });
  
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem("posTransactions");
    if (!savedTransactions) return [];
    
    const parsed = JSON.parse(savedTransactions);
    // Convert string dates back to Date objects
    return parsed.map((transaction: any) => ({
      ...transaction,
      timestamp: new Date(transaction.timestamp),
    }));
  });

  const { toast } = useToast();
  
  // Save to local storage when state changes
  useEffect(() => {
    localStorage.setItem("posProducts", JSON.stringify(products));
  }, [products]);
  
  useEffect(() => {
    localStorage.setItem("posTransactions", JSON.stringify(transactions));
  }, [transactions]);
  
  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: generateId(),
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
    
    toast({
      title: "Product Added",
      description: `${product.name} has been added to your inventory.`,
    });
  };
  
  const editProduct = (updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    
    toast({
      title: "Product Updated",
      description: `${updatedProduct.name} has been updated.`,
    });
  };
  
  const deleteProduct = (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
    
    if (productToDelete) {
      toast({
        title: "Product Deleted",
        description: `${productToDelete.name} has been removed.`,
      });
    }
  };
  
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity
        };
        return newCart;
      } else {
        // Add new item to cart
        return [...prevCart, { product, quantity }];
      }
    });
    
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} added to cart.`,
    });
  };
  
  const removeFromCart = (productId: string) => {
    const itemToRemove = cart.find(item => item.product.id === productId);
    
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    
    if (itemToRemove) {
      toast({
        title: "Removed from Cart",
        description: `${itemToRemove.product.name} removed from cart.`,
      });
    }
  };
  
  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  const processTransaction = (paymentMethod: PaymentMethod) => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before processing transaction.",
        variant: "destructive",
      });
      return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    const transaction: Transaction = {
      id: generateId(),
      items: [...cart],
      total,
      paymentMethod,
      timestamp: new Date(),
    };
    
    setTransactions(prev => [...prev, transaction]);
    
    // Update product stock if applicable
    setProducts(prevProducts => 
      prevProducts.map(product => {
        const cartItem = cart.find(item => item.product.id === product.id);
        if (cartItem && product.stock !== undefined) {
          return {
            ...product,
            stock: Math.max(0, product.stock - cartItem.quantity)
          };
        }
        return product;
      })
    );
    
    clearCart();
    
    toast({
      title: "Sale Complete",
      description: `Transaction of $${total.toFixed(2)} processed successfully.`,
    });
  };
  
  const contextValue: POSContextType = {
    products,
    cart,
    transactions,
    addProduct,
    editProduct,
    deleteProduct,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    processTransaction
  };
  
  return (
    <POSContext.Provider value={contextValue}>
      {children}
    </POSContext.Provider>
  );
};

// Sample products for initial setup
function getSampleProducts(): Product[] {
  return [
    {
      id: "p1",
      name: "1 Hour Game Time",
      price: 10.0,
      category: "gameTime",
      description: "1 hour of gameplay on any available device"
    },
    {
      id: "p2",
      name: "2 Hour Game Time",
      price: 18.0,
      category: "gameTime",
      description: "2 hours of gameplay on any available device"
    },
    {
      id: "p3",
      name: "Gaming T-Shirt",
      price: 24.99,
      category: "merchandise",
      stock: 15,
      description: "Cool gaming-themed t-shirt"
    },
    {
      id: "p4",
      name: "Soda",
      price: 2.50,
      category: "drink",
      stock: 50,
      description: "Refreshing beverage"
    },
    {
      id: "p5",
      name: "Chips",
      price: 1.99,
      category: "food",
      stock: 30,
      description: "Tasty snack"
    }
  ];
}
