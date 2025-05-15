
import { Product } from "@/types/pos";

// Sample game time products for initial setup
export function getSampleProducts(): Product[] {
  return [
    {
      id: "p1",
      name: "30 Minutes Game Time",
      price: 5.0,
      category: "gameTime",
      description: "30 minutes of gameplay on any available device",
      duration: 30
    },
    {
      id: "p2",
      name: "1 Hour Game Time",
      price: 10.0,
      category: "gameTime",
      description: "1 hour of gameplay on any available device",
      duration: 60
    },
    {
      id: "p3",
      name: "2 Hours Game Time",
      price: 18.0,
      category: "gameTime",
      description: "2 hours of gameplay on any available device",
      duration: 120
    },
    {
      id: "p4",
      name: "All-Day Pass",
      price: 35.0,
      category: "gameTime",
      description: "Unlimited gameplay from open until close",
      duration: 720 // Assuming 12 hours of operation
    }
  ];
}
