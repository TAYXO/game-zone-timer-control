
import React, { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { useGameZone } from "@/context/GameZoneContext";
import { ProductCategory, PaymentMethod } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Coins, Package, Timer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";
import ProductForm from "@/components/pos/ProductForm";

const POSPage: React.FC = () => {
  const { products, processTransaction } = usePOS();
  const { devices } = useGameZone();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerName, setCustomerName] = useState("");

  // Only use gameTime category as the main focus
  const categories: ProductCategory[] = ["gameTime"];
  
  const filteredProducts = searchQuery 
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products.filter(p => p.category === "gameTime");

  const handlePayment = (method: PaymentMethod) => {
    processTransaction(method, customerName || undefined);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Game Time Sales</h1>
        <Button onClick={() => setIsAddProductModalOpen(true)}>
          <Timer className="mr-2" /> Add Game Time Package
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Search game time packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Game Time Packages</h2>
              <ProductGrid products={filteredProducts} />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="sticky top-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <ShoppingCart className="mr-2" /> Current Sale
                </h2>
              </div>
              
              <div className="mb-4">
                <Input
                  placeholder="Customer name (optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              
              <Cart />
              
              <div className="mt-6 grid grid-cols-3 gap-4">
                <Button onClick={() => handlePayment('cash')} className="bg-green-600 hover:bg-green-700">
                  <Coins className="mr-2" /> Cash
                </Button>
                <Button onClick={() => handlePayment('card')}>Card</Button>
                <Button onClick={() => handlePayment('mobile')}>Mobile</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isAddProductModalOpen && (
        <ProductForm 
          onClose={() => setIsAddProductModalOpen(false)} 
          isOpen={isAddProductModalOpen}
        />
      )}
    </div>
  );
};

export default POSPage;
