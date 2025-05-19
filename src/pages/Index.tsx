
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Shield, Gamepad } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to Game Zone Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Point of Sale</CardTitle>
            <CardDescription>Manage sales and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Process orders, manage inventory, and track sales in real-time.</p>
            <Link to="/pos" className="text-blue-500 hover:text-blue-700 underline">
              Go to POS
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>View recent transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Access your transaction history and generate reports.</p>
            <Link to="/transactions" className="text-blue-500 hover:text-blue-700 underline">
              View Transactions
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generate comprehensive business reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Get insights into your sales, expenses, and overall business performance.</p>
            <Link to="/reports" className="text-blue-500 hover:text-blue-700 underline">
              View Reports
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Track and manage business expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Record and categorize all your business expenses.</p>
            <Link to="/expenses" className="text-blue-500 hover:text-blue-700 underline">
              Manage Expenses
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Summary</CardTitle>
            <CardDescription>Overview of your sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View analytics and summaries of your sales data.</p>
            <Link to="/sales-summary" className="text-blue-500 hover:text-blue-700 underline">
              View Summary
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-primary/10">
            <CardTitle className="flex items-center">
              <Gamepad className="h-5 w-5 mr-2" />
              Device Management
            </CardTitle>
            <CardDescription>Game Zone Devices</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage and monitor your gaming devices and sessions.</p>
            <Link to="/devices" className="text-blue-500 hover:text-blue-700 underline">
              Manage Devices
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-primary/10">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
            <CardDescription>PIN and Security Settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage PIN authentication and system security settings.</p>
            <Link to="/pin-management" className="text-blue-500 hover:text-blue-700 underline">
              Manage PIN Security
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure system preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Adjust application settings and preferences.</p>
            <Link to="/settings" className="text-blue-500 hover:text-blue-700 underline">
              Open Settings
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
