'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Eye, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddOfflineSaleDialog } from "@/components/orders/AddOfflineSaleDialog";
import { CodeGeneratedDialog } from "@/components/orders/CodeGeneratedDialog";

export default function OrdersPaymentsPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [codes, setCodes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [adminMap, setAdminMap] = useState<Record<string, { email: string; role: string }>>({});
  const [courseMap, setCourseMap] = useState<Record<string, string>>({});
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [codesLoading, setCodesLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'codes'>('transactions');
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    fetchAdmins();
    fetchTransactions();
    fetchCourses();
  }, []);

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
      const response = await fetch(
        `${API_ENDPOINTS.ORDERS_PAYMENTS.TRANSACTIONS.LIST}?limit=50&status=pending-code-redemption`,
        createFetchOptions('GET')
      );
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
        if (data.courseMap) {
          setCourseMap(prev => ({ ...prev, ...data.courseMap }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchCourses = async () => {
    if (courses.length > 0) return;

    try {
      setCoursesLoading(true);
      const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
      const response = await fetch(API_ENDPOINTS.COURSES.DROPDOWN, createFetchOptions('GET'));
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
        const map: Record<string, string> = {};
        data.data.forEach((course: any) => {
          map[course._id] = course.title;
        });
        setCourseMap(prev => ({ ...prev, ...map }));
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchCodes = async () => {
    if (codes.length > 0) return;

    try {
      setCodesLoading(true);
      const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
      const response = await fetch(
        `${API_ENDPOINTS.ORDERS_PAYMENTS.CODES.LIST}?limit=50&sortBy=createdAt&order=desc`,
        createFetchOptions('GET')
      );
      const data = await response.json();
      if (data.success) {
        setCodes(data.data);
        if (data.courseMap) {
          setCourseMap(prev => ({ ...prev, ...data.courseMap }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch codes:', error);
      toast({
        title: "Error",
        description: "Failed to load unlock codes",
        variant: "destructive",
      });
    } finally {
      setCodesLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
      const response = await fetch(API_ENDPOINTS.ADMINS.LIST, createFetchOptions('GET'));
      const data = await response.json();
      if (data.success) {
        const map: Record<string, { email: string; role: string }> = {};
        data.admins.forEach((admin: any) => {
          map[admin._id] = { email: admin.email, role: admin.role };
        });
        setAdminMap(map);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  };

  const formatIssuerInfo = (issuedByAdminId: string, issuedByRole: string) => {
    const admin = adminMap[issuedByAdminId];
    if (admin) {
      return `${admin.role} (${admin.email})`;
    }
    return `${issuedByRole} (${issuedByAdminId})`;
  };

  const handleSubmitTransaction = async (formData: any) => {
    setLoading(true);
    try {
      let paymentReference = formData.paymentReference;

      // Handle screenshot upload
      if (formData.paymentReferenceType === 'screenshot' && formData.paymentScreenshot) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(formData.paymentScreenshot!);
        });
        paymentReference = base64;
      }

      const submitData = {
        buyerName: formData.buyerName,
        contact: formData.contact,
        paymentReferenceType: formData.paymentReferenceType,
        paymentReference,
        paymentMethod: formData.paymentMethod,
        courseId: formData.course,
        amount: formData.amount,
        notes: formData.notes,
      };

      const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
      const response = await fetch(
        API_ENDPOINTS.ORDERS_PAYMENTS.TRANSACTIONS.CREATE,
        createFetchOptions('POST', submitData)
      );
      const data = await response.json();

      if (data.success) {
        const unlockCode = data.data.unlockCode.code;
        setGeneratedCode(unlockCode);
        setIsCodeDialogOpen(true);
        toast({
          title: "Success",
          description: `Transaction created! Unlock code: ${unlockCode}`,
        });
        setIsAddDialogOpen(false);
        fetchTransactions();
        fetchCodes();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create transaction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
   <div>
           <div className="flex items-center gap-2">
                      <Receipt className="h-6 w-6 text-primary" />
                      <CardTitle className="text-3xl font-bold text-gray-900">Orders & Payments</CardTitle>
                  </div>
          <p className="text-gray-600 mt-2">Manage and track orders and payments for courses</p>
        </div>        <AddOfflineSaleDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          courses={courses}
          coursesLoading={coursesLoading}
          onSubmit={handleSubmitTransaction}
          loading={loading}
        />
        <CodeGeneratedDialog
          open={isCodeDialogOpen}
          onOpenChange={setIsCodeDialogOpen}
          code={generatedCode}
        />
      </div>

      <div className="grid gap-6">
        {/* Tabs */}
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => {
              setActiveTab('codes');
              fetchCodes();
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'codes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unlock Codes
          </button>
        </div>

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
              <CardDescription>Transactions awaiting code redemption</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                          Loading transactions...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction: any) => (
                      <TableRow key={transaction._id}>
                        <TableCell>
                          <div className="font-medium">{transaction.buyerName}</div>
                          <div className="text-sm text-muted-foreground">{transaction.contact}</div>
                        </TableCell>
                        <TableCell>
                          {courseMap[transaction.courseId]
                            ? `${courseMap[transaction.courseId]} (${transaction.courseId})`
                            : transaction.courseId}
                        </TableCell>
                        <TableCell>{transaction.paymentMethod}</TableCell>
                        <TableCell>Rs. {transaction.amount}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{transaction.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Codes Tab */}
        {activeTab === 'codes' && (
          <Card>
            <CardHeader>
              <CardTitle>Unlock Codes</CardTitle>
              <CardDescription>Generated unlock codes and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Input placeholder="Search codes..." className="max-w-sm" />
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Issued To</TableHead>
                    <TableHead>Issued By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                          Loading codes...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : codes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No unlock codes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    codes.map((code: any) => (
                      <TableRow key={code._id}>
                        <TableCell className="font-mono font-bold text-blue-600">
                          {code.code || '***'}
                        </TableCell>
                        <TableCell>
                          {courseMap[code.courseId]
                            ? `${courseMap[code.courseId]} (${code.courseId})`
                            : code.courseId}
                        </TableCell>
                        <TableCell>{code.issuedTo}</TableCell>
                        <TableCell>
                          {code.issuedByAdminId && code.issuedByRole
                            ? formatIssuerInfo(code.issuedByAdminId, code.issuedByRole)
                            : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={code.isUsed ? "secondary" : "default"}>
                            {code.isUsed ? "Used" : "Unused"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {code.expiresOn ? new Date(code.expiresOn).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}