import React, { createContext, useState, useEffect } from "react";
import { Product, CartItem, Transaction, PaymentMethod } from "@/types/pos";
import { generateId } from "@/utils/gameUtils";
import { useToast } from "@/hooks/use-toast";
import { useGameZone } from "@/context/GameZoneContext";
import { POSContextType } from "./types";
import { getSampleProducts } from "./sampleProducts";
import { supabase } from "@/integrations/supabase/client";

export const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const { devices } = useGameZone();
  
  // Load data from Supabase on component mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from('pos_products')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Map database data to our Product type
          const mappedProducts: Product[] = data.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            category: item.category as any,
            description: item.description || undefined,
            stock: item.stock || undefined,
            deviceId: item.device_id || undefined,
            duration: item.duration || undefined
          }));
          
          setProducts(mappedProducts.length > 0 ? mappedProducts : getSampleProducts());
        }
      } catch (error: any) {
        console.error("Error loading products:", error.message);
        // Fall back to sample products if there's an error
        setProducts(getSampleProducts());
      }
    }
    
    async function loadTransactions() {
      try {
        const { data, error } = await supabase
          .from('pos_transactions')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Map database data to our Transaction type
          const mappedTransactions: Transaction[] = data.map(item => ({
            id: item.id,
            items: item.items as any,
            total: Number(item.total),
            paymentMethod: item.payment_method as PaymentMethod,
            timestamp: new Date(item.timestamp),
            deviceId: item.device_id || undefined,
            customerName: item.customer_name || undefined
          }));
          
          setTransactions(mappedTransactions);
        }
      } catch (error: any) {
        console.error("Error loading transactions:", error.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadProducts();
    loadTransactions();
  }, []);
  
  const addProduct = async (product: Omit<Product, "id">): Promise<Product | undefined> => {
    try {
      // Map to database schema
      const dbProduct = {
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        stock: product.stock,
        device_id: product.deviceId,
        duration: product.duration
      };
      
      const { data, error } = await supabase
        .from('pos_products')
        .insert([dbProduct])
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const newProduct: Product = {
          id: data[0].id,
          name: data[0].name,
          price: Number(data[0].price),
          category: data[0].category as any,
          description: data[0].description || undefined,
          stock: data[0].stock || undefined,
          deviceId: data[0].device_id || undefined,
          duration: data[0].duration || undefined
        };
        
        setProducts(prev => [...prev, newProduct]);
        
        toast({
          title: "Product Added",
          description: `${product.name} has been added to your inventory.`,
        });
        
        return newProduct;
      }
      
      return undefined;
    } catch (error: any) {
      console.error("Error adding product:", error.message);
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
      return undefined;
    }
  };
  
  const editProduct = async (updatedProduct: Product) => {
    try {
      // Map to database schema
      const dbProduct = {
        id: updatedProduct.id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        category: updatedProduct.category,
        description: updatedProduct.description,
        stock: updatedProduct.stock,
        device_id: updatedProduct.deviceId,
        duration: updatedProduct.duration
      };
      
      const { error } = await supabase
        .from('pos_products')
        .update(dbProduct)
        .eq('id', updatedProduct.id);
      
      if (error) {
        throw error;
      }
      
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
      
      toast({
        title: "Product Updated",
        description: `${updatedProduct.name} has been updated.`,
      });
    } catch (error: any) {
      console.error("Error updating product:", error.message);
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const deleteProduct = async (productId: string) => {
    try {
      const productToDelete = products.find(p => p.id === productId);
      
      const { error } = await supabase
        .from('pos_products')
        .delete()
        .eq('id', productId);
      
      if (error) {
        throw error;
      }
      
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      
      if (productToDelete) {
        toast({
          title: "Product Deleted",
          description: `${productToDelete.name} has been removed.`,
        });
      }
    } catch (error: any) {
      console.error("Error deleting product:", error.message);
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
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
  
  const processTransaction = async (paymentMethod: PaymentMethod, customerName?: string) => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before processing transaction.",
        variant: "destructive",
      });
      return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    try {
      // Map to database schema
      const dbTransaction = {
        items: cart,
        total: total,
        payment_method: paymentMethod,
        customer_name: customerName,
      };
      
      const { data, error } = await supabase
        .from('pos_transactions')
        .insert([dbTransaction])
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const transaction: Transaction = {
          id: data[0].id,
          items: data[0].items,
          total: Number(data[0].total),
          paymentMethod: data[0].payment_method as PaymentMethod,
          timestamp: new Date(data[0].timestamp),
          customerName: data[0].customer_name || undefined
        };
        
        setTransactions(prev => [...prev, transaction]);
        
        // Update product stock if applicable
        for (const item of cart) {
          if (item.product.stock !== undefined) {
            const updatedProduct = {
              ...item.product,
              stock: Math.max(0, item.product.stock - item.quantity)
            };
            
            await editProduct(updatedProduct);
          }
        }
        
        clearCart();
        
        toast({
          title: "Sale Complete",
          description: `Transaction of $${total.toFixed(2)} processed successfully.`,
        });
      }
    } catch (error: any) {
      console.error("Error processing transaction:", error.message);
      toast({
        title: "Error processing transaction",
        description: error.message,
        variant: "destructive",
      });
    }
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
    getTotalHoursByDevice,
    loading
  };
  
  return (
    <POSContext.Provider value={contextValue}>
      {children}
    </POSContext.Provider>
  );
};
