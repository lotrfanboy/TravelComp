import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trip, UserRole } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Wallet, Download, Filter, Plus, DollarSign, Receipt, CreditCard, PiggyBank } from 'lucide-react';

// Mock expense data
const expenses = [
  { id: 1, title: 'Flight to Bali', amount: 850, currency: 'USD', date: '2023-02-05', category: 'Transportation', trip: 'Bali Adventure' },
  { id: 2, title: 'Outpost Coworking (7 days)', amount: 105, currency: 'USD', date: '2023-02-16', category: 'Workspace', trip: 'Bali Adventure' },
  { id: 3, title: 'Villa Accommodation', amount: 560, currency: 'USD', date: '2023-02-15', category: 'Accommodation', trip: 'Bali Adventure' },
  { id: 4, title: 'Local SIM Card', amount: 20, currency: 'USD', date: '2023-02-15', category: 'Miscellaneous', trip: 'Bali Adventure' },
  { id: 5, title: 'Airport Transfer', amount: 35, currency: 'USD', date: '2023-02-15', category: 'Transportation', trip: 'Bali Adventure' },
  { id: 6, title: 'Restaurant Dinner', amount: 42, currency: 'USD', date: '2023-02-17', category: 'Food', trip: 'Bali Adventure' },
  { id: 7, title: 'Hotel in London', amount: 420, currency: 'GBP', date: '2023-04-06', category: 'Accommodation', trip: 'London Business Trip' },
  { id: 8, title: 'Train Tickets', amount: 58, currency: 'GBP', date: '2023-04-07', category: 'Transportation', trip: 'London Business Trip' },
  { id: 9, title: 'Client Dinner', amount: 135, currency: 'GBP', date: '2023-04-07', category: 'Food', trip: 'London Business Trip' },
  { id: 10, title: 'Conference Ticket', amount: 299, currency: 'GBP', date: '2023-04-08', category: 'Business', trip: 'London Business Trip' },
];

// Chart data
const categoryData = [
  { name: 'Transportation', value: 943 },
  { name: 'Accommodation', value: 980 },
  { name: 'Food', value: 177 },
  { name: 'Workspace', value: 105 },
  { name: 'Business', value: 299 },
  { name: 'Miscellaneous', value: 20 },
];

const tripData = [
  { name: 'Bali Adventure', Transportation: 885, Accommodation: 560, Food: 42, Workspace: 105, Miscellaneous: 20 },
  { name: 'London Business', Transportation: 58, Accommodation: 420, Food: 135, Business: 299, Miscellaneous: 0 },
];

const monthlyData = [
  { name: 'Jan', amount: 0 },
  { name: 'Feb', amount: 1612 },
  { name: 'Mar', amount: 0 },
  { name: 'Apr', amount: 912 },
  { name: 'May', amount: 0 },
  { name: 'Jun', amount: 0 },
  { name: 'Jul', amount: 0 },
  { name: 'Aug', amount: 0 },
  { name: 'Sep', amount: 0 },
  { name: 'Oct', amount: 0 },
  { name: 'Nov', amount: 0 },
  { name: 'Dec', amount: 0 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Budget: React.FC = () => {
  const { user } = useAuth();
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  // Fetch trips
  const { data: trips, isLoading: tripsLoading } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
  });

  // Filter expenses based on selected trip
  const filteredExpenses = selectedTrip
    ? expenses.filter(expense => expense.trip === selectedTrip)
    : expenses;

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((sum, expense) => {
      // Simple conversion for demo purposes
      const convertedAmount = expense.currency === 'GBP' ? expense.amount * 1.3 : expense.amount;
      return sum + convertedAmount;
    }, 0);
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case UserRole.TOURIST:
        return 'bg-yellow-500 hover:bg-yellow-600';
      case UserRole.NOMAD:
        return 'bg-emerald-500 hover:bg-emerald-600';
      case UserRole.BUSINESS:
        return 'bg-indigo-500 hover:bg-indigo-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Travel Budget</h1>
          <p className="text-gray-500 mt-1">Track and manage your travel expenses</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => {}}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            className={getRoleColor()}
            onClick={() => {}}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <Select 
              value={selectedTrip || "all"} 
              onValueChange={(value) => setSelectedTrip(value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Trips" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trips</SelectItem>
                <SelectItem value="Bali Adventure">Bali Adventure</SelectItem>
                <SelectItem value="London Business Trip">London Business Trip</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-grow">
            <Select 
              value={selectedCurrency} 
              onValueChange={setSelectedCurrency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(getTotalExpenses(), 'USD')}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-md">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Accommodation</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(980, 'USD')}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-md">
                <Home className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Transportation</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(943, 'USD')}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-md">
                <Plane className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Remaining Budget</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(4500 - getTotalExpenses(), 'USD')}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-md">
                <PiggyBank className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${(getTotalExpenses() / 4500) * 100}%` }}
                />
              </div>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Budget: $4,500</span>
              <span>{Math.round((getTotalExpenses() / 4500) * 100)}% Used</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Expense List */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Expense List</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Expense Transactions</CardTitle>
              <CardDescription>
                View all your travel expenses in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Expense</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Trip</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{expense.title}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            expense.category === 'Transportation' ? 'bg-yellow-100 text-yellow-800' :
                            expense.category === 'Accommodation' ? 'bg-green-100 text-green-800' :
                            expense.category === 'Food' ? 'bg-red-100 text-red-800' :
                            expense.category === 'Workspace' ? 'bg-blue-100 text-blue-800' :
                            expense.category === 'Business' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{expense.trip}</td>
                        <td className="px-4 py-3 text-gray-500">{expense.date}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {expense.currency} {expense.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Trip</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={tripData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Legend />
                      <Bar dataKey="Transportation" stackId="a" fill="#FFBB28" />
                      <Bar dataKey="Accommodation" stackId="a" fill="#00C49F" />
                      <Bar dataKey="Food" stackId="a" fill="#FF8042" />
                      <Bar dataKey="Workspace" stackId="a" fill="#0088FE" />
                      <Bar dataKey="Business" stackId="a" fill="#8884D8" />
                      <Bar dataKey="Miscellaneous" stackId="a" fill="#82CA9D" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Total Expenses']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#3B82F6"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Budget Reports</CardTitle>
              <CardDescription>
                Generate custom reports for your travel expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <Receipt className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Trip Summary</h3>
                    <p className="text-sm text-gray-500">
                      Detailed breakdown of expenses by trip
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Category Analysis</h3>
                    <p className="text-sm text-gray-500">
                      View spending patterns by category
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Payment Methods</h3>
                    <p className="text-sm text-gray-500">
                      Track expenses by payment type
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                      <Download className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Export Data</h3>
                    <p className="text-sm text-gray-500">
                      Download reports in CSV/PDF format
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Custom Report</h3>
                        <p className="text-sm text-gray-500">
                          Generate a custom expense report for specific dates and categories
                        </p>
                      </div>
                      <Button className={getRoleColor()}>
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Budget;
