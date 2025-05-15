
import React from "react";
import { usePOS } from "@/context/POSContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartItemQuantity, clearCart } = usePOS();
  
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
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
          <div key={item.product.id} className="flex justify-between items-center py-2 border-b">
            <div>
              <div className="font-medium">{item.product.name}</div>
              <div className="text-sm text-muted-foreground">
                ${item.product.price.toFixed(2)} each
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateCartItemQuantity(item.product.id, parseInt(e.target.value))}
                className="w-16 text-center"
              />
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => removeFromCart(item.product.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
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
