"use client"
export const runtime = 'edge';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  getUserById, 
  deleteUser,
  sendPasswordResetEmail,
  resendVerificationEmail,
  confirmUserEmail,
  updateUserStatus,
  changeUserPassword,
  updateUser,
} from '@/lib/api/users';
import { UserDetail } from '@/interface/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  IconArrowLeft, 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconCalendar,
  IconShield,
  IconCheck,
  IconX,
  IconEdit,
  IconTrash,
  IconKey,
  IconToggleLeft,
  IconToggleRight,
  IconCircleCheckFilled,
  IconClock,
  IconUsers,
  IconWorld,
  IconAlertTriangle,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AuditLogsDataTable } from '@/components/audit-logs/audit-logs-data-table';
import { AuditLogDetailDialog } from '@/components/audit-logs/audit-log-detail-dialog';
import { useAuditLogsStore } from '@/store/useAuditLogsStore';
import { IconHistory } from '@tabler/icons-react';
import { CalendarIcon } from "lucide-react";
import { AuditLog, AuditLogFilters } from '@/interface/AuditLog';

const toDateOnly = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const formatDate = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const adjusted = new Date(date.getTime() - offsetMs);
  return adjusted.toISOString().slice(0, 10);
};

const parseDateValue = (value: string) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return toDateOnly(parsed);
};

const clampDateValue = (value: string, min: Date, max: Date) => {
  const parsed = parseDateValue(value);
  if (!parsed) {
    return formatDate(min);
  }

  const clampedTime = Math.min(max.getTime(), Math.max(min.getTime(), parsed.getTime()));
  return formatDate(new Date(clampedTime));
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    isEmailVerified: false,
    isActive: true,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  const {
    auditLogs,
    isLoading: isLoadingLogs,
    total: totalLogs,
    page: logsPage,
    limit: logsLimit,
    availableFilters,
    fetchAuditLogsByUserId,
  } = useAuditLogsStore();

  // Filter states for audit logs tab
  const [searchInput, setSearchInput] = useState<string>('');
  const [entityIdInput, setEntityIdInput] = useState<string>('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const todayDate = useMemo(() => toDateOnly(new Date()), []);
  const minDate = useMemo(() => {
    const min = new Date(todayDate);
    min.setDate(min.getDate() - 30);
    return min;
  }, [todayDate]);
  const todayString = useMemo(() => formatDate(todayDate), [todayDate]);
  const minDateString = useMemo(() => formatDate(minDate), [minDate]);
  const [dateFromInput, setDateFromInput] = useState<string>(() => minDateString);
  const [dateToInput, setDateToInput] = useState<string>(() => todayString);
  const [successFilter, setSuccessFilter] = useState<string>('all');
  const [isAdminActionFilter, setIsAdminActionFilter] = useState<string>('all');
  const [isSystemFilter, setIsSystemFilter] = useState<string>('all');
  const lastAppliedDatesRef = useRef<{ from: string; to: string }>({
    from: minDateString,
    to: todayString,
  });
  const lastAppliedFiltersRef = useRef<string>('');

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getUserById(Number(userId));
      
      if ((response.status === 0 || response.status === 200) && response.data) {
        setUser(response.data);
      } else {
        setError(response.message || 'Error loading user');
      }
    } catch (err) {
      console.error('❌ Error fetching user:', err);
      setError('Error loading user');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  const buildLogsFilters = useCallback(
    (overrides?: Partial<AuditLogFilters>): AuditLogFilters => {
      const effectivePage = overrides?.page ?? logsPage;
      const effectiveLimit = overrides?.limit ?? logsLimit;

      const filters: AuditLogFilters = {
        page: effectivePage,
        limit: effectiveLimit,
      };

      const searchValue = (overrides?.search !== undefined ? overrides.search : searchInput)?.trim();
      if (searchValue) {
        filters.search = searchValue;
      }

      const entityIdSource = overrides?.entityId !== undefined ? `${overrides.entityId}` : entityIdInput;
      const entityIdValue = entityIdSource?.trim();
      if (entityIdValue) {
        const parsed = parseInt(entityIdValue, 10);
        if (!isNaN(parsed)) {
          filters.entityId = parsed;
        }
      }

      const actionTypeValue = overrides?.actionType !== undefined ? overrides.actionType : actionTypeFilter;
      if (actionTypeValue && actionTypeValue !== 'all') {
        filters.actionType = actionTypeValue;
      }

      const dateFromValue = overrides?.dateFrom !== undefined ? overrides.dateFrom : dateFromInput.trim();
      if (dateFromValue) {
        filters.dateFrom = dateFromValue;
      }

      const dateToValue = overrides?.dateTo !== undefined ? overrides.dateTo : dateToInput.trim();
      if (dateToValue) {
        filters.dateTo = dateToValue;
      }

      // Handle success filter: overrides can be boolean, state is string
      if (overrides?.success !== undefined) {
        filters.success = overrides.success;
      } else if (successFilter && successFilter !== 'all') {
        filters.success = successFilter === 'true';
      }

      // Handle isAdminAction filter: overrides can be boolean, state is string
      if (overrides?.isAdminAction !== undefined) {
        filters.isAdminAction = overrides.isAdminAction;
      } else if (isAdminActionFilter && isAdminActionFilter !== 'all') {
        filters.isAdminAction = isAdminActionFilter === 'true';
      }

      // Handle isSystem filter: overrides can be boolean, state is string
      if (overrides?.isSystem !== undefined) {
        filters.isSystem = overrides.isSystem;
      } else if (isSystemFilter && isSystemFilter !== 'all' && isSystemFilter !== 'false') {
        filters.isSystem = isSystemFilter === 'true';
      }

      return filters;
    },
    [
      searchInput,
      entityIdInput,
      actionTypeFilter,
      dateFromInput,
      dateToInput,
      successFilter,
      isAdminActionFilter,
      isSystemFilter,
      logsPage,
      logsLimit,
    ]
  );

  const applyLogsFilters = useCallback(
    (overrides?: Partial<AuditLogFilters>) => {
      if (!user?.id) {
        return;
      }

      const filters = buildLogsFilters(overrides);
      const filtersKey = JSON.stringify(filters);
      if (filtersKey === lastAppliedFiltersRef.current) {
        return;
      }
      lastAppliedFiltersRef.current = filtersKey;
      lastAppliedDatesRef.current = {
        from: filters.dateFrom ?? '',
        to: filters.dateTo ?? '',
      };

      setTimeout(() => {
        fetchAuditLogsByUserId(user.id, filters);
      }, 0);
    },
    [user?.id, buildLogsFilters, fetchAuditLogsByUserId]
  );

  const handleDateFromBlur = useCallback(() => {
    const trimmedValue = dateFromInput.trim();
    const sanitizedFrom = trimmedValue
      ? clampDateValue(trimmedValue, minDate, todayDate)
      : minDateString;

    if (sanitizedFrom !== dateFromInput) {
      setDateFromInput(sanitizedFrom);
    }

    const minForToDate = sanitizedFrom ? parseDateValue(sanitizedFrom) ?? minDate : minDate;
    const sanitizedTo = dateToInput
      ? clampDateValue(dateToInput.trim(), minForToDate, todayDate)
      : todayString;

    if (sanitizedTo !== dateToInput) {
      setDateToInput(sanitizedTo);
    }

    const { from: lastFrom, to: lastTo } = lastAppliedDatesRef.current;

    if (sanitizedFrom === lastFrom && sanitizedTo === lastTo) {
      return;
    }

    lastAppliedDatesRef.current = {
      from: sanitizedFrom,
      to: sanitizedTo,
    };

    applyLogsFilters({
      page: 1,
      dateFrom: sanitizedFrom || undefined,
      dateTo: sanitizedTo || undefined,
    });
  }, [applyLogsFilters, dateFromInput, dateToInput, minDate, minDateString, todayDate, todayString]);

  const handleDateToBlur = useCallback(() => {
    const trimmedValue = dateToInput.trim();
    const minForToDate = dateFromInput
      ? parseDateValue(dateFromInput) ?? minDate
      : minDate;
    const sanitizedTo = trimmedValue
      ? clampDateValue(trimmedValue, minForToDate, todayDate)
      : todayString;

    if (sanitizedTo !== dateToInput) {
      setDateToInput(sanitizedTo);
    }

    const maxForFromDate = parseDateValue(sanitizedTo) ?? todayDate;
    const sanitizedFrom = dateFromInput
      ? clampDateValue(dateFromInput.trim(), minDate, maxForFromDate)
      : minDateString;
    if (sanitizedFrom !== dateFromInput) {
      setDateFromInput(sanitizedFrom);
    }

    applyLogsFilters({
      page: 1,
      dateFrom: sanitizedFrom || undefined,
      dateTo: sanitizedTo || undefined,
    });
  }, [applyLogsFilters, dateFromInput, dateToInput, minDate, minDateString, todayDate, todayString]);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyLogsFilters({ page: 1 });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    searchInput,
    applyLogsFilters,
  ]);

  // Check for edit query parameter
  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam === 'true' && user) {
      setShowEditDialog(true);
      // Initialize form with user data
      setEditFormData({
        email: user.email || '',
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        role: user.role || 'user',
        isEmailVerified: user.isEmailVerified || false,
        isActive: user.isActive !== false,
      });
      // Remove edit parameter from URL
      router.replace(`/users/${userId}`, { scroll: false });
    }
  }, [searchParams, user, userId, router]);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsActionLoading(true);
      await deleteUser(Number(userId));
      setShowDeleteDialog(false);
      toast.success('User deleted successfully');
      router.push('/users');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setIsActionLoading(true);
      const result = await sendPasswordResetEmail(Number(userId));
      
      if (result.status === 200 || result.status === 0) {
        toast.success(result.message || 'Password reset email sent successfully');
      } else {
        toast.error(result.message || 'Failed to send password reset email');
      }
    } catch (error) {
      console.error('Error in handleResetPassword:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send password reset email');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate before submitting
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    // Clear any errors before submitting
    setPasswordError('');
    setConfirmPasswordError('');

    try {
      setIsActionLoading(true);
      await changeUserPassword(Number(userId), newPassword, confirmPassword);
      toast.success('Password changed successfully');
      
      // Show success dialog to ask if user wants to close
      setShowSuccessDialog(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsActionLoading(true);
      await resendVerificationEmail(Number(userId));
      toast.success('Verification email sent successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmEmail = async () => {
    try {
      setIsActionLoading(true);
      await confirmUserEmail(Number(userId));
      await fetchUser();
      toast.success('Email confirmed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to confirm email');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setIsActionLoading(true);
      await updateUserStatus(Number(userId), !(user?.isActive !== false));
      await fetchUser();
      toast.success(`User ${user?.isActive !== false ? 'blocked' : 'activated'} successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user status');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEdit = () => {
    if (user) {
      setEditFormData({
        email: user.email || '',
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        role: user.role || 'user',
        isEmailVerified: user.isEmailVerified || false,
        isActive: user.isActive !== false,
      });
      setShowEditDialog(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!user) return;

    try {
      setIsActionLoading(true);
      await updateUser(Number(userId), {
        email: editFormData.email,
        username: editFormData.username,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phone: editFormData.phone || null,
        role: editFormData.role,
        isEmailVerified: editFormData.isEmailVerified,
        isActive: editFormData.isActive,
      });
      await fetchUser();
      setShowEditDialog(false);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 px-6 pt-6 pb-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/users">
              <Button variant="outline" size="sm" className="group">
                <IconArrowLeft className="!h-8 !w-8 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to list
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">User Details</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEdit}
              disabled={isActionLoading}
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetPassword}
              disabled={isActionLoading}
            >
              <IconMail className="h-4 w-4 mr-2" />
              Reset Password Email
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPasswordDialog(true)}
              disabled={isActionLoading}
            >
              <IconKey className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            {!user.isEmailVerified && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isActionLoading}
                >
                  <IconMail className="h-4 w-4 mr-2" />
                  Resend Verification
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleConfirmEmail}
                  disabled={isActionLoading}
                >
                  <IconCheck className="h-4 w-4 mr-2" />
                  Confirm Email
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleToggleStatus}
              disabled={isActionLoading}
            >
              {user.isActive !== false ? (
                <>
                  <IconToggleLeft className="h-4 w-4 mr-2" />
                  Block
                </>
              ) : (
                <>
                  <IconToggleRight className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteClick}
              disabled={isActionLoading}
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="flex flex-1 flex-col gap-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audit-logs">
              <IconHistory className="h-4 w-4 mr-2" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                {user.photo ? (
                  <div className="relative w-24 h-24">
                    <Image
                      src={user.photo}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                    <div 
                      className="w-full h-full bg-gray-200 rounded-full items-center justify-center text-gray-500 text-xs hidden"
                    >
                      No photo
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    <IconUser className="h-8 w-8" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">ID:</span>
                  <p className="text-lg font-semibold">{user.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">UUID:</span>
                  <p className="text-sm font-mono">{user.uuid}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Username:</span>
                  <p className="text-lg">{user.username}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Full name:</span>
                  <p className="text-lg">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Role:</span>
                  <div className="mt-1">
                    <Badge 
                      variant={user.role === "admin" ? "default" : "outline"}
                      className="text-sm"
                    >
                      <IconShield className="h-3 w-3 mr-1" />
                      {user.role === "admin" ? "Administrator" : "User"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <div className="mt-1">
                    <Badge 
                      variant={user.isActive !== false ? "default" : "outline"} 
                      className={user.isActive !== false ? "bg-green-500 hover:bg-green-600 text-white" : "text-muted-foreground"}
                    >
                      {user.isActive !== false ? (
                        <>
                          <IconCircleCheckFilled className="fill-white dark:fill-white mr-1 h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <IconX className="mr-1 h-3 w-3" />
                          Blocked
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconMail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <IconMail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Email:</span>
                    <p className="text-sm">{user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {user.isEmailVerified ? (
                        <IconCheck className="h-3 w-3 text-green-500" />
                      ) : (
                        <IconX className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {user.isEmailVerified ? "Verified" : "Not verified"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                    <p className="text-sm">{user.phone || 'Not specified'}</p>
                  </div>
                </div>

                {user.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Date of birth:</span>
                      <p className="text-sm">
                        {new Date(user.dateOfBirth).toLocaleDateString('uk-UA')}
                      </p>
                    </div>
                  </div>
                )}

                {user.timezone && (
                  <div className="flex items-center gap-3">
                    <IconWorld className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Timezone:</span>
                      <p className="text-sm">{user.timezone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Referral System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUsers className="h-5 w-5" />
                Referral System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Referral code:</span>
                  <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded text-black dark:text-white">{user.referralCode || 'Not set'}</p>
                </div>
                
                {user.referredByCode && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Invited by code:</span>
                    <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded text-black dark:text-white">{user.referredByCode}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-muted-foreground">Direct referrals:</span>
                  <p className="text-sm font-semibold">{user.childrenCount || 0}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-muted-foreground">Total referrals:</span>
                  <p className="text-sm font-semibold">{user.totalChildrenCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconClock className="h-5 w-5" />
                Dates & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Created:</span>
                  <p className="text-sm">
                    {new Date(user.createdAt).toLocaleString('uk-UA')}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Updated:</span>
                  <p className="text-sm">
                    {new Date(user.updatedAt).toLocaleString('uk-UA')}
                  </p>
                </div>

                {user.status && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Account Status:</span>
                    <div className="mt-1">
                      <Badge 
                        variant={user.status === "active" ? "default" : "outline"}
                        className={user.status === "active" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                      >
                        {user.status === "active" ? (
                          <>
                            <IconCircleCheckFilled className="fill-white dark:fill-white mr-1 h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <IconX className="mr-1 h-3 w-3" />
                            {user.status}
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit-logs" className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Audit Logs</h2>
                <p className="text-sm text-muted-foreground">
                  Page {logsPage} of {Math.ceil(totalLogs / logsLimit)} • Total: {totalLogs} logs
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  setEntityIdInput('');
                  setActionTypeFilter('all');
                  setDateFromInput(minDateString);
                  setDateToInput(todayString);
                  setSuccessFilter('all');
                  setIsAdminActionFilter('all');
                  setIsSystemFilter('all');
                  lastAppliedFiltersRef.current = '';
                  applyLogsFilters({
                    page: 1,
                    limit: 20,
                    search: undefined,
                    entityId: undefined,
                    actionType: undefined,
                    dateFrom: minDateString,
                    dateTo: todayString,
                    success: undefined,
                    isAdminAction: undefined,
                    isSystem: undefined,
                  });
                }}
              >
                <IconX className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>

            {/* Filters for Audit Logs Tab */}
            <div className="flex flex-wrap items-center gap-4 py-4 border-b">
              <div className="flex items-center gap-2">
                <Label htmlFor="search-logs" className="text-sm font-medium whitespace-nowrap">
                  Search:
                </Label>
                <Input
                  id="search-logs"
                  type="text"
                  placeholder="Search in descriptions..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-48"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="entityId-logs" className="text-sm font-medium whitespace-nowrap">
                  Entity ID:
                </Label>
                <Input
                  id="entityId-logs"
                  type="number"
                  placeholder="Entity ID"
                  value={entityIdInput}
                  onChange={(e) => setEntityIdInput(e.target.value)}
                  onBlur={() => applyLogsFilters({ page: 1 })}
                  className="w-32"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="actionType-logs" className="text-sm font-medium whitespace-nowrap">
                  Action Type:
                </Label>
                <Select
                  value={actionTypeFilter}
                  onValueChange={(value) => {
                    setActionTypeFilter(value);
                    // Use setTimeout to ensure state update happens first, then apply filters
                    setTimeout(() => {
                    applyLogsFilters({ page: 1, actionType: value === 'all' ? undefined : value });
                    }, 0);
                  }}
                >
                  <SelectTrigger id="actionType-logs" className="w-48">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {availableFilters?.actionTypes?.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="success-logs" className="text-sm font-medium whitespace-nowrap">
                  Status:
                </Label>
                <Select
                  value={successFilter}
                  onValueChange={(value) => {
                    setSuccessFilter(value);
                    // Use setTimeout to ensure state update happens first, then apply filters
                    setTimeout(() => {
                    applyLogsFilters({ page: 1, success: value === 'all' ? undefined : value === 'true' });
                    }, 0);
                  }}
                >
                  <SelectTrigger id="success-logs" className="w-32">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Success</SelectItem>
                    <SelectItem value="false">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="isAdminAction-logs" className="text-sm font-medium whitespace-nowrap">
                  Action Type:
                </Label>
                <Select
                  value={isAdminActionFilter}
                  onValueChange={(value) => {
                    setIsAdminActionFilter(value);
                    // Use setTimeout to ensure state update happens first, then apply filters
                    setTimeout(() => {
                    applyLogsFilters({ page: 1, isAdminAction: value === 'all' ? undefined : value === 'true' });
                    }, 0);
                  }}
                >
                  <SelectTrigger id="isAdminAction-logs" className="w-40">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Admin Actions</SelectItem>
                    <SelectItem value="false">User Actions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="isSystem-logs" className="text-sm font-medium whitespace-nowrap">
                  System Events:
                </Label>
                <Select
                  value={isSystemFilter}
                  onValueChange={(value) => {
                    setIsSystemFilter(value);
                    // Use setTimeout to ensure state update happens first, then apply filters
                    // If 'false' or 'all', don't filter (show all events)
                    // Only filter when explicitly set to 'true' (show only system events)
                    setTimeout(() => {
                    applyLogsFilters({ page: 1, isSystem: value === 'true' ? true : undefined });
                    }, 0);
                  }}
                >
                  <SelectTrigger id="isSystem-logs" className="w-40">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Show Only</SelectItem>
                    <SelectItem value="false">Hide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="dateFrom-logs" className="text-sm font-medium whitespace-nowrap">
                  From:
                </Label>
                <div className="relative w-48">
                  <Input
                    id="dateFrom-logs"
                    type="date"
                    value={dateFromInput}
                    onChange={(e) => setDateFromInput(e.target.value)}
                    onBlur={handleDateFromBlur}
                    min={minDateString}
                    max={todayString}
                    className="pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                  <CalendarIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="dateTo-logs" className="text-sm font-medium whitespace-nowrap">
                  To:
                </Label>
                <div className="relative w-48">
                  <Input
                    id="dateTo-logs"
                    type="date"
                    value={dateToInput}
                    onChange={(e) => setDateToInput(e.target.value)}
                    onBlur={handleDateToBlur}
                    min={dateFromInput || minDateString}
                    max={todayString}
                    className="pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                  <CalendarIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            <AuditLogsDataTable
              data={auditLogs}
              total={totalLogs}
              page={logsPage}
              limit={logsLimit}
              onPageChange={(newPage) => applyLogsFilters({ page: newPage, limit: logsLimit })}
              onPageSizeChange={(newLimit) => applyLogsFilters({ page: 1, limit: newLimit })}
              isLoading={isLoadingLogs}
              onViewDetails={(log) => {
                setSelectedLog(log);
                setShowDetailDialog(true);
              }}
              hideUserId={true}
            />
          </TabsContent>
        </Tabs>

        <AuditLogDetailDialog
          log={selectedLog}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />

        {/* Change Password Dialog */}
        <Dialog 
          open={showPasswordDialog} 
          onOpenChange={(open) => {
            if (!open) {
              // Ask before closing if there's any input
              if (newPassword || confirmPassword) {
                setShowCloseConfirmDialog(true);
              } else {
                // No input, close without asking
                setShowPasswordDialog(false);
              }
            } else {
              setShowPasswordDialog(open);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter a new password for {user.username}. All user sessions will be terminated.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewPassword(value);
                      
                      // Validate password length
                      if (value.length > 0 && value.length < 8) {
                        setPasswordError('Password must be at least 8 characters long');
                      } else {
                        setPasswordError('');
                      }
                      
                      // Validate match if confirm password is filled
                      if (confirmPassword && value !== confirmPassword) {
                        setConfirmPasswordError('Passwords do not match');
                      } else if (confirmPassword && value === confirmPassword) {
                        setConfirmPasswordError('');
                      }
                    }}
                    onBlur={() => {
                      if (newPassword.length > 0 && newPassword.length < 8) {
                        setPasswordError('Password must be at least 8 characters long');
                      } else {
                        setPasswordError('');
                      }
                    }}
                    placeholder="Enter new password (min 8 characters)"
                    className={`pr-10 ${passwordError ? 'border-red-500 focus-visible:border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <IconEye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setConfirmPassword(value);
                      
                      // Validate match
                      if (value && newPassword && value !== newPassword) {
                        setConfirmPasswordError('Passwords do not match');
                      } else if (value && newPassword && value === newPassword) {
                        setConfirmPasswordError('');
                      } else if (value && !newPassword) {
                        setConfirmPasswordError('');
                      } else {
                        setConfirmPasswordError('');
                      }
                    }}
                    onBlur={() => {
                      if (confirmPassword && newPassword && confirmPassword !== newPassword) {
                        setConfirmPasswordError('Passwords do not match');
                      } else {
                        setConfirmPasswordError('');
                      }
                    }}
                    placeholder="Confirm new password"
                    className={`pr-10 ${confirmPasswordError ? 'border-red-500 focus-visible:border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <IconEye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {confirmPasswordError && (
                  <p className="text-sm text-red-500 mt-1">{confirmPasswordError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                  setPasswordError('');
                  setConfirmPasswordError('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={isActionLoading}>
                Change Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information for {user.username}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username *</Label>
                  <Input
                    id="edit-username"
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    placeholder="username"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name *</Label>
                  <Input
                    id="edit-firstName"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name *</Label>
                  <Input
                    id="edit-lastName"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(value: 'user' | 'admin') => 
                      setEditFormData({ ...editFormData, role: value })
                    }
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isEmailVerified"
                    checked={editFormData.isEmailVerified}
                    onCheckedChange={(checked) => 
                      setEditFormData({ ...editFormData, isEmailVerified: checked === true })
                    }
                  />
                  <Label htmlFor="edit-isEmailVerified" className="cursor-pointer">
                    Email Verified
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isActive"
                    checked={editFormData.isActive}
                    onCheckedChange={(checked) => 
                      setEditFormData({ ...editFormData, isActive: checked === true })
                    }
                  />
                  <Label htmlFor="edit-isActive" className="cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isActionLoading}>
                {isActionLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <IconAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-center">
                Delete User?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                This action cannot be undone. This will permanently delete the user
                <span className="block mt-2 font-medium text-foreground">
                  &quot;{user.username || user.email}&quot;
                </span>
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel disabled={isActionLoading} className="w-full sm:w-auto">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isActionLoading}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                {isActionLoading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Close Password Dialog Confirmation */}
        <AlertDialog open={showCloseConfirmDialog} onOpenChange={setShowCloseConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <IconAlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-center">
                Close Dialog?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                You have unsaved changes. Are you sure you want to close?
                <span className="block mt-2 text-sm text-muted-foreground">
                  All entered password data will be lost.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel 
                onClick={() => setShowCloseConfirmDialog(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowCloseConfirmDialog(false);
                  setShowPasswordDialog(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                  setPasswordError('');
                  setConfirmPasswordError('');
                }}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
              >
                Close Dialog
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Success Dialog - Password Changed */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                  <IconCircleCheckFilled className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <AlertDialogTitle className="text-center text-xl">
                Password Changed Successfully
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-base mt-2">
                The password has been changed successfully. All user sessions have been terminated.
                <span className="block mt-2 text-sm text-muted-foreground">
                  Do you want to close the dialog?
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel
                onClick={() => {
                  setShowSuccessDialog(false);
                  // Clear passwords but keep dialog open
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                  setPasswordError('');
                  setConfirmPasswordError('');
                }}
                className="w-full sm:w-auto"
              >
                Keep Open
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowSuccessDialog(false);
                  setShowPasswordDialog(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                  setPasswordError('');
                  setConfirmPasswordError('');
                }}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                Close Dialog
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
