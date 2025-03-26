import React from 'react';
import { SubscriptionDetails } from '@/components/subscription/subscription-details';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Download, Receipt, CreditCard, History } from 'lucide-react';

export default function AccountSubscriptionPage() {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  // In a real application, these would be fetched from an API
  const invoices = [
    { id: 'INV-001', date: '2025-02-15', amount: 79, status: 'Paid' },
    { id: 'INV-002', date: '2025-01-15', amount: 79, status: 'Paid' },
    { id: 'INV-003', date: '2024-12-15', amount: 79, status: 'Paid' },
  ];

  const paymentMethods = [
    { 
      id: 'pm_1', 
      type: 'card', 
      brand: 'visa', 
      last4: '4242', 
      expMonth: 12, 
      expYear: 25,
      isDefault: true 
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Subscription & Billing</h1>

        <div className="space-y-8">
          {/* Current Subscription */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
            <SubscriptionDetails onUpgrade={handleUpgrade} />
          </div>

          {/* Billing Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
            <Tabs defaultValue="payment-methods">
              <TabsList className="mb-4">
                <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="usage-history">Usage History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="payment-methods">
                <Card className="p-6">
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="font-medium">Your Payment Methods</h3>
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                  
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div 
                          key={method.id} 
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="mr-4">
                              {method.brand === 'visa' && (
                                <div className="text-blue-600 font-bold text-xl">VISA</div>
                              )}
                              {method.brand === 'mastercard' && (
                                <div className="text-red-600 font-bold text-xl">MC</div>
                              )}
                              {method.brand === 'amex' && (
                                <div className="text-blue-800 font-bold text-xl">AMEX</div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                •••• •••• •••• {method.last4}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Expires {method.expMonth}/{method.expYear}
                              </div>
                              {method.isDefault && (
                                <div className="text-xs text-green-600 mt-1">
                                  Default payment method
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            {!method.isDefault && (
                              <Button variant="ghost" size="sm">
                                Make Default
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-red-500">
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        You don't have any payment methods yet.
                      </p>
                      <Button>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </div>
                  )}
                </Card>
              </TabsContent>
              
              <TabsContent value="invoices">
                <Card className="p-6">
                  <div className="mb-4">
                    <h3 className="font-medium">Invoice History</h3>
                  </div>
                  
                  {invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Invoice</th>
                            <th className="text-left py-3 px-4">Date</th>
                            <th className="text-left py-3 px-4">Amount</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-right py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map((invoice) => (
                            <tr key={invoice.id} className="border-b">
                              <td className="py-3 px-4">{invoice.id}</td>
                              <td className="py-3 px-4">
                                {new Date(invoice.date).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">${invoice.amount}</td>
                              <td className="py-3 px-4">
                                <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        You don't have any invoices yet.
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>
              
              <TabsContent value="usage-history">
                <Card className="p-6">
                  <div className="mb-4">
                    <h3 className="font-medium">Credit Usage History</h3>
                  </div>
                  
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      Detailed usage history will be available soon.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      We're working on this feature to help you track your credit usage over time.
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Billing Address */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
            <Card className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-medium">Your Billing Address</h3>
                <Button variant="outline" size="sm">
                  Edit Address
                </Button>
              </div>
              
              <div className="space-y-1">
                <p>John Doe</p>
                <p>Acme Corporation</p>
                <p>123 Business Street</p>
                <p>Suite 456</p>
                <p>San Francisco, CA 94107</p>
                <p>United States</p>
              </div>
            </Card>
          </div>

          {/* Tax Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Tax Information</h2>
            <Card className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-medium">Tax ID</h3>
                <Button variant="outline" size="sm">
                  Add Tax ID
                </Button>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400">
                No tax ID provided. Adding a tax ID may exempt you from certain taxes depending on your location.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
