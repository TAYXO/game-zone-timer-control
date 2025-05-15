
import React, { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { useGameZone } from "@/context/GameZoneContext";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChartBarIcon,
  Clock,
  CalendarClock,
  Settings,
  DollarSign
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

const SalesSummaryPage: React.FC = () => {
  const { transactions, getTotalSalesByDevice, getTotalHoursByDevice } = usePOS();
  const { devices } = useGameZone();
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });
  
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  });
  
  const handleDailyView = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    setStartDate(today);
    setEndDate(endOfDay);
  };
  
  const handleWeeklyView = () => {
    const today = new Date();
    const start = startOfWeek(today);
    const end = endOfWeek(today);
    end.setHours(23, 59, 59, 999);
    
    setStartDate(start);
    setEndDate(end);
  };
  
  const handleMonthlyView = () => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    end.setHours(23, 59, 59, 999);
    
    setStartDate(start);
    setEndDate(end);
  };
  
  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.timestamp);
    return date >= startDate && date <= endDate;
  });
  
  // Calculate summary statistics
  const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = filteredTransactions.length;
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  
  // Create data for the hourly usage chart by device
  const deviceHoursData = devices.map(device => {
    return {
      name: device.name,
      hours: Number((getTotalHoursByDevice(device.id)).toFixed(2)),
      revenue: Number(getTotalSalesByDevice(device.id).toFixed(2))
    };
  });
  
  // Create data for the payment method breakdown
  const paymentMethodData = filteredTransactions.reduce((acc: any[], t) => {
    const existing = acc.find(item => item.name === t.paymentMethod);
    if (existing) {
      existing.amount += t.total;
      existing.count += 1;
    } else {
      acc.push({
        name: t.paymentMethod,
        amount: t.total,
        count: 1
      });
    }
    return acc;
  }, []);

  // Format for export
  const exportToCSV = () => {
    // Creating CSV header
    const headers = ['Date', 'Time', 'Transaction ID', 'Items', 'Total', 'Payment Method', 'Customer'];
    
    // Format transaction data
    const csvData = filteredTransactions.map(t => [
      format(new Date(t.timestamp), 'yyyy-MM-dd'),
      format(new Date(t.timestamp), 'HH:mm:ss'),
      t.id,
      t.items.map(item => `${item.quantity}x ${item.product.name}`).join(', '),
      t.total.toFixed(2),
      t.paymentMethod,
      t.customerName || 'N/A'
    ]);
    
    // Combine headers and data
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Sales Summary</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          <Input
            type="date"
            value={format(startDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              const date = new Date(e.target.value);
              date.setHours(0, 0, 0, 0);
              setStartDate(date);
            }}
          />
          <span className="flex items-center">to</span>
          <Input
            type="date"
            value={format(endDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              const date = new Date(e.target.value);
              date.setHours(23, 59, 59, 999);
              setEndDate(date);
            }}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDailyView}>Today</Button>
          <Button variant="outline" onClick={handleWeeklyView}>This Week</Button>
          <Button variant="outline" onClick={handleMonthlyView}>This Month</Button>
          <Button variant="outline" onClick={exportToCSV}>Export CSV</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
              ${totalSales.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTransactions}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Sale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageTransaction.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="devices" className="mb-8">
        <TabsList>
          <TabsTrigger value="devices">Device Usage</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Usage & Revenue by Device</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deviceHoursData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="hours" name="Hours Used" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Hours Used</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deviceHoursData.map((d) => (
                    <TableRow key={d.name}>
                      <TableCell>{d.name}</TableCell>
                      <TableCell>{d.hours}</TableCell>
                      <TableCell>${d.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentMethodData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" name="Amount ($)" fill="#8884d8" />
                    <Bar dataKey="count" name="# of Transactions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead># of Transactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethodData.map((pm) => (
                    <TableRow key={pm.name}>
                      <TableCell className="capitalize">{pm.name}</TableCell>
                      <TableCell>${pm.amount.toFixed(2)}</TableCell>
                      <TableCell>{pm.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Customer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        {format(new Date(t.timestamp), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{t.id.substring(0, 8)}</TableCell>
                      <TableCell>
                        {t.items.map(item => `${item.quantity}x ${item.product.name}`).join(', ')}
                      </TableCell>
                      <TableCell>${t.total.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{t.paymentMethod}</TableCell>
                      <TableCell>{t.customerName || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesSummaryPage;
