
import React, { createContext, useState, useEffect } from "react";
import { Product, CartItem, Transaction, PaymentMethod } from "@/types/pos";
import { generateId } from "@/utils/gameUtils";
import { useToast } from "@/hooks/use-toast";
import { useGameZone } from "@/context/GameZoneContext";
import { POSContextType } from "./types";
import { getSampleProducts } from "./sampleProducts";

export const POSContext = createContext<POSContextType | undefined>(undefined);

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
  const { devices } = useGameZone();
  
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
  
  const processTransaction = (paymentMethod: PaymentMethod, customerName?: string) => {
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
      customerName: customerName || undefined,
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

  // Utility functions for reporting
  const getTransactionsByDate = (date: Date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return transactions.filter(transaction => {
      const txDate = new Date(transaction.timestamp);
      return txDate >= targetDate && txDate < nextDay;
    });
  };
  
  const getTransactionsByDateRange = (startDate: Date, endDate: Date) => {
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    
    return transactions.filter(transaction => {
      const txDate = new Date(transaction.timestamp);
      return txDate >= startDateObj && txDate <= endDateObj;
    });
  };
  
  const getTotalSalesByDevice = (deviceId?: string) => {
    return transactions.reduce((total, transaction) => {
      // If deviceId is specified, only include transactions for that device
      if (deviceId) {
        const deviceTransactions = transaction.items.filter(
          item => item.product.category === 'gameTime' && item.product.deviceId === deviceId
        );
        
        return total + deviceTransactions.reduce(
          (sum, item) => sum + (item.product.price * item.quantity), 0
        );
      } else {
        // Include all gameTime transactions
        const gameTimeTransactions = transaction.items.filter(
          item => item.product.category === 'gameTime'
        );
        
        return total + gameTimeTransactions.reduce(
          (sum, item) => sum + (item.product.price * item.quantity), 0
        );
      }
    }, 0);
  };
  
  const getTotalHoursByDevice = (deviceId?: string) => {
    return transactions.reduce((totalHours, transaction) => {
      // Filter items for gameTime category and matching deviceId if specified
      const relevantItems = transaction.items.filter(item => 
        item.product.category === 'gameTime' && 
        (!deviceId || item.product.deviceId === deviceId)
      );
      
      // Sum up the hours
      const hours = relevantItems.reduce((sum, item) => {
        // Extract duration from product name or use a default conversion
        // Assuming product name format like "1 Hour Game Time"
        const durationMatch = item.product.name.match(/(\d+)\s*(Hour|Minute)/i);
        let durationHours = 0;
        
        if (durationMatch) {
          const value = parseInt(durationMatch[1], 10);
          const unit = durationMatch[2].toLowerCase();
          
          durationHours = unit === 'hour' ? value : value / 60;
        } else if (item.product.duration) {
          // If product has duration property (in minutes), convert to hours
          durationHours = item.product.duration / 60;
        }
        
        return sum + (durationHours * item.quantity);
      }, 0);
      
      return totalHours + hours;
    }, 0);
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
    processTransaction,
    getTransactionsByDate,
    getTransactionsByDateRange,
    getTotalSalesByDevice,
    getTotalHoursByDevice
  };
  
  return (
    <POSContext.Provider value={contextValue}>
      {children}
    </POSContext.Provider>
  );
};
