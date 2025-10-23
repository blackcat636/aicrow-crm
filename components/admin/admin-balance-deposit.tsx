"use client"

import { useState, useEffect } from 'react';
import { useUsersStore } from '@/store/useUsersStore';
// Remove direct API call, use Next.js API route instead
import { AdminDepositRequest } from '@/interface/Balance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { IconCoins, IconUser, IconMessage, IconTag, IconCheck, IconAlertTriangle, IconSearch } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getCookieValue } from '@/lib/auth';

interface AdminBalanceDepositProps {
  onSuccess?: () => void;
}

export function AdminBalanceDeposit({ onSuccess }: AdminBalanceDepositProps) {
  const { users, fetchUsers, isLoading: usersLoading } = useUsersStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);
  
  const [formData, setFormData] = useState<AdminDepositRequest>({
    userId: 0,
    amount: 0,
    comment: '',
    referenceId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load users on component mount
  useEffect(() => {
    fetchUsers(1, 100);
  }, [fetchUsers]);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const username = user.username?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const firstName = user.firstName?.toLowerCase() || '';
    const lastName = user.lastName?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
    
    return username.includes(searchLower) ||
           email.includes(searchLower) ||
           fullName.includes(searchLower);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    setFormData(prev => ({ ...prev, userId }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedUserId || selectedUserId <= 0) {
      newErrors.userId = 'Please select a user';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (formData.amount > 1000000) {
      newErrors.amount = 'Maximum amount is 1,000,000';
    } else {
      // Check decimal places
      const amountStr = formData.amount.toString();
      const decimalPart = amountStr.split('.')[1];
      if (decimalPart && decimalPart.length > 8) {
        newErrors.amount = 'Maximum 8 decimal places allowed';
      }
    }

    if (formData.comment && formData.comment.length > 500) {
      newErrors.comment = 'Comment must be 500 characters or less';
    }

    if (formData.referenceId && formData.referenceId.length > 100) {
      newErrors.referenceId = 'Reference ID must be 100 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getCookieValue('access_token');
      
      const response = await fetch('/api/admin/balance/admin-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to process admin deposit');
      }
      
      toast.success('Balance deposit completed successfully', {
        description: `Deposited ${formData.amount} to user ${formData.userId}`
      });

      // Reset form
      setFormData({
        userId: 0,
        amount: 0,
        comment: '',
        referenceId: ''
      });
      setSelectedUserId(null);
      setCurrentPage(1);
      setShowConfirmDialog(false);
      
      onSuccess?.();
    } catch (error) {
      console.error('Admin deposit error:', error);
      toast.error('Failed to deposit balance', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUser = users.find(user => user.id === selectedUserId);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Select User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <IconSearch className="h-4 w-4" />
                Search User
              </Label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Email, username, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Found {filteredUsers.length} of {users.length} users • Page {currentPage} of {totalPages}
              </p>
            </div>

            {/* User List */}
            <div className="space-y-2">
              <Label>Select User:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-1">
                {usersLoading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Loading users...
                  </div>
                ) : paginatedUsers.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                ) : (
        paginatedUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserSelect(user.id)}
            className={`flex items-start gap-3 p-3 border rounded-lg hover:bg-muted transition-colors text-left w-full ${
              selectedUserId === user.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
          >
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user.firstName?.[0] || user.username?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {(user.firstName && user.lastName)
                  ? `${user.firstName} ${user.lastName}`
                  : user.username || 'Unknown User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
              {user.role === 'admin' && (
                <p className="text-xs text-primary font-medium">
                  Super Admin
                </p>
              )}
            </div>
          </button>
        ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {errors.userId && (
              <p className="text-sm text-red-500">{errors.userId}</p>
            )}
          </CardContent>
        </Card>

        {/* Deposit Form */}
        {selectedUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCoins className="h-5 w-5" />
                Deposit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected User Info */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Selected User:</h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedUser.firstName?.[0] || selectedUser.username[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {(selectedUser.firstName && selectedUser.lastName)
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : selectedUser.username || 'Unknown User'}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <IconCoins className="h-4 w-4" />
                  Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  min="0"
                  max="1000000"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className={errors.amount ? 'border-red-500' : ''}
                  placeholder="0.00"
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                <p className="text-xs text-muted-foreground">
                  Maximum: 1,000,000 • Precision: up to 8 decimal places
                </p>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment" className="flex items-center gap-2">
                  <IconMessage className="h-4 w-4" />
                  Comment
                </Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  className={errors.comment ? 'border-red-500' : ''}
                  placeholder="Operation description (optional)"
                  rows={3}
                />
                {errors.comment && <p className="text-sm text-red-500">{errors.comment}</p>}
                <p className="text-xs text-muted-foreground">
                  Maximum: 500 characters • Current length: {formData.comment?.length || 0}
                </p>
              </div>

              {/* Reference ID */}
              <div className="space-y-2">
                <Label htmlFor="referenceId" className="flex items-center gap-2">
                  <IconTag className="h-4 w-4" />
                  Reference ID
                </Label>
                <Input
                  id="referenceId"
                  value={formData.referenceId}
                  onChange={(e) => setFormData(prev => ({ ...prev, referenceId: e.target.value }))}
                  className={errors.referenceId ? 'border-red-500' : ''}
                  placeholder="ADMIN_DEPOSIT_2024_001"
                />
                {errors.referenceId && <p className="text-sm text-red-500">{errors.referenceId}</p>}
                <p className="text-xs text-muted-foreground">
                  Maximum: 100 characters • Current length: {formData.referenceId?.length || 0}
                </p>
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Operation Confirmation:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>User:</strong> {selectedUser.username || 'Unknown User'} ({selectedUser.email})</p>
                  <p><strong>Amount:</strong> {formData.amount}</p>
                  {formData.comment && <p><strong>Comment:</strong> {formData.comment}</p>}
                  {formData.referenceId && <p><strong>Reference ID:</strong> {formData.referenceId}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    disabled={isSubmitting || !selectedUserId || !formData.amount}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <IconCheck className="mr-2 h-4 w-4" />
                        Deposit Balance
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <IconAlertTriangle className="h-5 w-5 text-orange-500" />
                      Operation Confirmation
                    </AlertDialogTitle>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div>Are you sure you want to deposit balance to this user?</div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div><strong>User:</strong> {selectedUser.username || 'Unknown User'}</div>
                        <div><strong>Email:</strong> {selectedUser.email}</div>
                        <div><strong>Amount:</strong> {formData.amount}</div>
                        {formData.comment && <div><strong>Comment:</strong> {formData.comment}</div>}
                      </div>
                      <div className="text-sm text-orange-600 font-medium">
                        This operation will be logged in audit with your name.
                      </div>
                    </div>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? 'Processing...' : 'Confirm'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!selectedUser && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <IconUser className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select User</h3>
              <p className="text-muted-foreground">
                To deposit balance, select a user from the list above
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
