
import React, { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { ProductCategory, PaymentMethod } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Coins, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";
import ProductForm from "@/components/pos/ProductForm";

const POSPage: React.FC = () => {
  const { products, processTransaction } = usePOS();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories: ProductCategory[] = ["gameTime", "merchandise", "food", "drink"];
  
  const filteredProducts = searchQuery 
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  const handlePayment = (method: PaymentMethod) => {
    processTransaction(method);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Point of Sale</h1>
        <Button onClick={() => setIsAddProductModalOpen(true)}>
          <Package className="mr-2" /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" className="mb-6">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category === "gameTime" ? "Game Time" : 
                   category === "merchandise" ? "Merch" : 
                   category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              <ProductGrid products={filteredProducts} />
            </TabsContent>
            
            {categories.map(category => (
              <TabsContent key={category} value={category}>
                <ProductGrid products={filteredProducts.filter(p => p.category === category)} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <div>
          <Card className="sticky top-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <ShoppingCart className="mr-2" /> Current Sale
                </h2>
              </div>
              
              <Cart />
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button onClick={() => handlePayment('cash')} className="bg-green-600 hover:bg-green-700">
                  <Coins className="mr-2" /> Cash
                </Button>
                <Button onClick={() => handlePayment('card')}>Card</Button>
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
