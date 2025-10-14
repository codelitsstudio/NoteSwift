'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Search, Download, Eye, Upload, Copy, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with API calls
const mockTransactions = [
  { id: "1", buyerName: "John Doe", contact: "john@example.com", paymentMethod: "eSewa Personal", course: "Math 101", amount: "500", status: "Pending Code Redemption", date: "2024-10-14", notes: "Paid via WhatsApp" },
];

const mockCodes = [
  { id: "1", code: "IEA-21JA-WA", courseId: "math101", issuedTo: "John Doe", issuedBy: "admin", isUsed: false, expiresOn: "2024-10-21", createdAt: "2024-10-14" },
];

export default function OrdersPaymentsPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddDialogOpen = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (open && courses.length === 0) {
      fetchCourses();
    }
  };
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [isViewCodeDialogOpen, setIsViewCodeDialogOpen] = useState(false);
  const [isCodeGeneratedDialogOpen, setIsCodeGeneratedDialogOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedCode, setSelectedCode] = useState<any>(null);
  const [transactions, setTransactions] = useState([]);
  const [codes, setCodes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [adminMap, setAdminMap] = useState<Record<string, { email: string; role: string }>>({});
  const [courseMap, setCourseMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [codesLoading, setCodesLoading] = useState(false);
  const [viewCodeLoading, setViewCodeLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [formData, setFormData] = useState({
    buyerName: "",
    contact: "",
    paymentReferenceType: "transaction-id",
    paymentReference: "",
    paymentScreenshot: null as File | null,
    paymentMethod: "",
    course: "",
    amount: "",
    notes: "",
  });

  // Fetch data on mount - load transactions first, then codes
  useEffect(() => {
    fetchAdmins();
    fetchTransactions().then(() => {
      // Load codes after transactions are loaded to avoid overwhelming the server
      setTimeout(() => fetchCodes(), 100);
    });
  }, []);

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders-payments/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchCodes = async () => {
    try {
      setCodesLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders-payments/codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCodes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch codes:', error);
    } finally {
      setCodesLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
        // Create course ID to name mapping
        const map: Record<string, string> = {};
        data.data.forEach((course: any) => {
          map[course._id] = course.title;
        });
        setCourseMap(map);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAdmins(data.admins);
        // Create admin ID to email/role mapping
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

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsViewTransactionDialogOpen(true);
  };

  const handleViewCode = async (code: any) => {
    // Check if we already have the transaction data cached
    if (code.transaction) {
      setSelectedCode(code);
      setIsViewCodeDialogOpen(true);
      return;
    }

    try {
      setViewCodeLoading(true);
      setIsViewCodeDialogOpen(true); // Open dialog immediately to show loading state

      // Fetch code details with transaction data in one call
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/orders-payments/codes/${code._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setSelectedCode(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch code details",
          variant: "destructive",
        });
        setIsViewCodeDialogOpen(false); // Close dialog on error
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch code details",
        variant: "destructive",
      });
      setIsViewCodeDialogOpen(false); // Close dialog on error
    } finally {
      setViewCodeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let paymentReference = formData.paymentReference;

      // Handle screenshot upload
      if (formData.paymentReferenceType === 'screenshot' && formData.paymentScreenshot) {
        // For now, convert to base64. In production, upload to Cloudinary
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

      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders-payments/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });
      const data = await response.json();
      
      if (data.success) {
        // Show the generated code in a dialog instead of just toast
        setGeneratedCode(data.data.unlockCode);
        setIsCodeGeneratedDialogOpen(true);
        setIsAddDialogOpen(false);
        
        // Reset form
        setFormData({
          buyerName: "",
          contact: "",
          paymentReferenceType: "transaction-id",
          paymentReference: "",
          paymentScreenshot: null,
          paymentMethod: "",
          course: "",
          amount: "",
          notes: "",
        });
        
        // Refresh data
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
        <h1 className="text-4xl font-bold font-headline tracking-tight">Orders & Payments</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Offline Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Offline Sale</DialogTitle>
              <DialogDescription>
                Record a manual payment and generate an unlock code for the buyer.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyerName">Buyer Name</Label>
                  <Input
                    id="buyerName"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact (Phone/WhatsApp)</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Payment Reference</Label>
                <RadioGroup
                  value={formData.paymentReferenceType}
                  onValueChange={(value) => setFormData({ ...formData, paymentReferenceType: value })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transaction-id" id="transaction-id" />
                    <Label htmlFor="transaction-id">Transaction ID</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="screenshot" id="screenshot" />
                    <Label htmlFor="screenshot">Upload Screenshot</Label>
                  </div>
                </RadioGroup>
                {formData.paymentReferenceType === 'transaction-id' ? (
                  <Input
                    className="mt-2"
                    placeholder="Enter transaction ID"
                    value={formData.paymentReference}
                    onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                  />
                ) : (
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setFormData({ ...formData, paymentScreenshot: file });
                      }}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.paymentScreenshot && (
                      <p className="text-sm text-gray-600 mt-1">
                        Selected: {formData.paymentScreenshot.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="esewa-personal">eSewa Personal</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: any) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="amount">Amount Paid</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the payment"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Confirm & Generate Code"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Transaction Dialog */}
        <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Complete details of the offline payment transaction
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Buyer Name</Label>
                    <p className="text-sm">{selectedTransaction.buyerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Contact</Label>
                    <p className="text-sm">{selectedTransaction.contact}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <p className="text-sm">{selectedTransaction.paymentMethod}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <p className="text-sm">Rs. {selectedTransaction.amount}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Course ID</Label>
                  <p className="text-sm">{selectedTransaction.courseId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Reference Type</Label>
                  <p className="text-sm">{selectedTransaction.paymentReferenceType}</p>
                </div>
                {selectedTransaction.paymentReferenceType === 'transaction-id' ? (
                  <div>
                    <Label className="text-sm font-medium">Transaction ID</Label>
                    <p className="text-sm font-mono">{selectedTransaction.paymentReference}</p>
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm font-medium">Payment Screenshot</Label>
                    {selectedTransaction.paymentReference?.startsWith('data:') ? (
                      <img
                        src={selectedTransaction.paymentReference}
                        alt="Payment Screenshot"
                        className="max-w-full h-auto mt-2 rounded border"
                        loading="lazy"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">Screenshot not available</p>
                    )}
                  </div>
                )}
                {selectedTransaction.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm">{selectedTransaction.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant="secondary">{selectedTransaction.status}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {selectedTransaction.unlockCodeId && (
                  <div>
                    <Label className="text-sm font-medium">Unlock Code ID</Label>
                    <p className="text-sm font-mono">{selectedTransaction.unlockCodeId}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      The unlock code was generated and provided to the buyer when this transaction was created.
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Code Dialog */}
        <Dialog open={isViewCodeDialogOpen} onOpenChange={setIsViewCodeDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Unlock Code & Transaction Details</DialogTitle>
              <DialogDescription>
                Complete details of the unlock code and associated transaction
              </DialogDescription>
            </DialogHeader>
            {viewCodeLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-sm text-muted-foreground">Loading code details...</p>
              </div>
            ) : selectedCode && (
              <div className="space-y-4">
                {/* Unlock Code Display */}
                <div>
                  <Label className="text-sm font-medium">Unlock Code</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-mono font-bold">{selectedCode.code}</p>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCode.code);
                        toast({
                          title: "Copied!",
                          description: "Code copied to clipboard",
                        });
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Code Information */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Course</Label>
                    <p className="text-sm">{courseMap[selectedCode.courseId] ? `${courseMap[selectedCode.courseId]} (${selectedCode.courseId})` : selectedCode.courseId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge variant={selectedCode.isUsed ? "secondary" : "default"}>
                        {selectedCode.isUsed ? "Used" : "Unused"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Issued To</Label>
                    <p className="text-sm">{selectedCode.issuedTo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Issued By</Label>
                    <p className="text-sm">{selectedCode.issuedByAdminId && selectedCode.issuedByRole ? formatIssuerInfo(selectedCode.issuedByAdminId, selectedCode.issuedByRole) : 'Unknown'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Expires On</Label>
                    <p className="text-sm">{selectedCode.expiresOn ? new Date(selectedCode.expiresOn).toLocaleString() : 'Never'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm">{new Date(selectedCode.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {selectedCode.isUsed && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Used By User ID</Label>
                        <p className="text-sm font-mono">{selectedCode.usedByUserId || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Used At</Label>
                        <p className="text-sm">{selectedCode.usedTimestamp ? new Date(selectedCode.usedTimestamp).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                    {selectedCode.usedDeviceHash && (
                      <div>
                        <Label className="text-sm font-medium">Device Hash</Label>
                        <p className="text-sm font-mono break-all">{selectedCode.usedDeviceHash}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Transaction Details */}
                {selectedCode.transaction && (
                  <>
                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium text-muted-foreground">TRANSACTION DETAILS</Label>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Buyer Name</Label>
                        <p className="text-sm">{selectedCode.transaction.buyerName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Contact</Label>
                        <p className="text-sm">{selectedCode.transaction.contact}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Payment Method</Label>
                        <p className="text-sm">{selectedCode.transaction.paymentMethod}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Amount</Label>
                        <p className="text-sm">Rs. {selectedCode.transaction.amount}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Course</Label>
                      <p className="text-sm">{courseMap[selectedCode.transaction.courseId] ? `${courseMap[selectedCode.transaction.courseId]} (${selectedCode.transaction.courseId})` : selectedCode.transaction.courseId}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Payment Reference Type</Label>
                      <p className="text-sm">{selectedCode.transaction.paymentReferenceType}</p>
                    </div>

                    {selectedCode.transaction.paymentReferenceType === 'transaction-id' ? (
                      <div>
                        <Label className="text-sm font-medium">Transaction ID</Label>
                        <p className="text-sm font-mono">{selectedCode.transaction.paymentReference}</p>
                      </div>
                    ) : (
                      <div>
                        <Label className="text-sm font-medium">Payment Screenshot</Label>
                        {selectedCode.transaction.paymentReference?.startsWith('data:') ? (
                          <img
                            src={selectedCode.transaction.paymentReference}
                            alt="Payment Screenshot"
                            className="max-w-full h-auto mt-2 rounded border"
                            loading="lazy"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">Screenshot not available</p>
                        )}
                      </div>
                    )}

                    {selectedCode.transaction.notes && (
                      <div>
                        <Label className="text-sm font-medium">Notes</Label>
                        <p className="text-sm">{selectedCode.transaction.notes}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Transaction Status</Label>
                        <div className="mt-1">
                          <Badge variant="secondary">{selectedCode.transaction.status}</Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Transaction Created</Label>
                        <p className="text-sm">{new Date(selectedCode.transaction.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Code Generated Dialog */}
      <Dialog open={isCodeGeneratedDialogOpen} onOpenChange={setIsCodeGeneratedDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-green-600">✅ Unlock Code Generated Successfully!</DialogTitle>
            <DialogDescription>
              Transaction created and unlock code generated. Please copy and securely store this code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
              <Label className="text-sm font-medium text-green-800 mb-2 block">Your Unlock Code</Label>
              <p className="text-2xl font-mono font-bold text-green-700 tracking-wider mb-4">
                {generatedCode}
              </p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  toast({
                    title: "Copied!",
                    description: "Code copied to clipboard",
                  });
                }}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Next Steps:</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Copy and securely store this code</p>
                <p>• Send the code to the buyer via WhatsApp/email</p>
                <p>• The code expires in 7 days</p>
                <p>• Once used, the code cannot be reused</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  // Could add WhatsApp sharing functionality here
                  const message = `Your unlock code: ${generatedCode}\nValid for 7 days.`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share via WhatsApp
              </Button>
              <Button
                onClick={() => setIsCodeGeneratedDialogOpen(false)}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6">
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
                      </TableCell><TableCell>{courseMap[transaction.courseId] ? `${courseMap[transaction.courseId]}(${transaction.courseId})` : transaction.courseId}</TableCell><TableCell>{transaction.paymentMethod}</TableCell><TableCell>Rs. {transaction.amount}</TableCell><TableCell>
                        <Badge variant="secondary">{transaction.status}</Badge>
                      </TableCell><TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell><TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(transaction)}>
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
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Loading codes...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : codes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No unlock codes found
                    </TableCell>
                  </TableRow>
                ) : (
                  codes.map((code: any) => (
                    <TableRow key={code._id}>
                      <TableCell className="font-mono font-bold text-blue-600">{code.code || '***'}</TableCell><TableCell>{courseMap[code.courseId] ? `${courseMap[code.courseId]}(${code.courseId})` : code.courseId}</TableCell><TableCell>{code.issuedTo}</TableCell><TableCell>{code.issuedByAdminId && code.issuedByRole ? formatIssuerInfo(code.issuedByAdminId, code.issuedByRole) : 'Unknown'}</TableCell><TableCell>
                        <Badge variant={code.isUsed ? "secondary" : "default"}>
                          {code.isUsed ? "Used" : "Unused"}
                        </Badge>
                      </TableCell><TableCell>{code.expiresOn ? new Date(code.expiresOn).toLocaleDateString() : 'N/A'}</TableCell><TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewCode(code)}>
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
      </div>
    </div>
  );
}