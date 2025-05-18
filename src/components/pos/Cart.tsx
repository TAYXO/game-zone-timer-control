
import React, { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/types/pos";

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartItemQuantity, clearCart, updateCartItemDetails } = usePOS();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{price: number, duration?: number}>({
    price: 0,
    duration: undefined
  });
  
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  const handleEditStart = (item: CartItem) => {
    setEditingItemId(item.product.id);
    setEditValues({
      price: item.product.price,
      duration: item.product.duration
    });
  };
  
  const handleEditCancel = () => {
    setEditingItemId(null);
  };
  
  const handleEditSave = (productId: string) => {
    updateCartItemDetails(productId, editValues);
    setEditingItemId(null);
  };
  
  if (cart.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Cart is empty</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
        {cart.map(item => (
          <div key={item.product.id} className="flex justify-between items-start py-2 border-b">
            <div className="flex-1">
              <div className="font-medium">{item.product.name}</div>
              
              {editingItemId === item.product.id ? (
                <div className="mt-1 space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground w-16">Price:</span>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={editValues.price}
                      onChange={(e) => setEditValues({...editValues, price: parseFloat(e.target.value)})}
                      className="w-24 h-8 text-sm"
                    />
                  </div>
                  
                  {item.product.category === 'gameTime' && (
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground w-16">Minutes:</span>
                      <Input
                        type="number"
                        min={1}
                        value={editValues.duration}
                        onChange={(e) => setEditValues({...editValues, duration: parseInt(e.target.value)})}
                        className="w-24 h-8 text-sm"
                      />
                    </div>
                  )}
                  
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 px-2"
                      onClick={() => handleEditSave(item.product.id)}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 px-2"
                      onClick={handleEditCancel}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  ${item.product.price.toFixed(2)} each
                  {item.product.duration && ` (${item.product.duration} minutes)`}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-2">
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateCartItemQuantity(item.product.id, parseInt(e.target.value))}
                className="w-16 text-center"
                disabled={editingItemId === item.product.id}
              />
              
              {editingItemId !== item.product.id && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditStart(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t">
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between font-bold text-lg mb-4">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={clearCart}
        >
          Clear Cart
        </Button>
      </div>
    </div>
  );
};

export default Cart;
