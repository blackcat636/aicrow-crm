"use client"
export const runtime = 'edge';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuditLogsDataTable } from "@/components/audit-logs/audit-logs-data-table"
import { AuditLogDetailDialog } from "@/components/audit-logs/audit-log-detail-dialog"
import { useAuditLogsStore } from "@/store/useAuditLogsStore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AuditLog, AuditLogFilters } from '@/interface/AuditLog'
import { IconX } from '@tabler/icons-react'
import { CalendarIcon } from "lucide-react"

const updateUrlWithFilters = (filters: AuditLogFilters) => {
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams();

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  params.set('page', page.toString());
  params.set('limit', limit.toString());

  if (filters.entityId !== undefined) {
    params.set('entityId', filters.entityId.toString());
  }
  if (filters.actionType) {
    params.set('actionType', filters.actionType);
  }
  if (filters.dateFrom) {
    params.set('dateFrom', filters.dateFrom);
  }
  if (filters.dateTo) {
    params.set('dateTo', filters.dateTo);
  }
  if (filters.success !== undefined) {
    params.set('success', filters.success.toString());
  }
  if (filters.search) {
    params.set('search', filters.search);
  }
  if (filters.isAdminAction !== undefined) {
    params.set('isAdminAction', filters.isAdminAction.toString());
  }
  if (filters.isSystem !== undefined) {
    params.set('isSystem', filters.isSystem.toString());
  }

  const queryString = params.toString();
  const newUrl = queryString ? `/audit-logs?${queryString}` : '/audit-logs';

  window.history.replaceState(null, '', newUrl);
};

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
    return '';
  }

  const clampedTime = Math.min(max.getTime(), Math.max(min.getTime(), parsed.getTime()));
  return formatDate(new Date(clampedTime));
};

export default function AuditLogsPage() {
  const {
    auditLogs,
    isLoading,
    error,
    total,
    page,
    limit,
    availableFilters,
    fetchAuditLogs,
    filters: appliedFilters,
  } = useAuditLogsStore();

  const searchParams = useSearchParams();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const todayDate = useMemo(() => toDateOnly(new Date()), []);
  const minDate = useMemo(() => {
    const min = new Date(todayDate);
    min.setDate(min.getDate() - 30);
    return min;
  }, [todayDate]);
  const todayString = useMemo(() => formatDate(todayDate), [todayDate]);
  const minDateString = useMemo(() => formatDate(minDate), [minDate]);

  // Filter states
  const [entityIdInput, setEntityIdInput] = useState<string>('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [dateFromInput, setDateFromInput] = useState<string>(() => minDateString);
  const [dateToInput, setDateToInput] = useState<string>(() => todayString);
  const [successFilter, setSuccessFilter] = useState<string>('all');
  const [searchInput, setSearchInput] = useState<string>('');
  const [isAdminActionFilter, setIsAdminActionFilter] = useState<string>('all');
  const [isSystemFilter, setIsSystemFilter] = useState<string>('all');
  const lastAppliedDatesRef = useRef<{ from: string; to: string }>({
    from: minDateString,
    to: todayString,
  });
  const hasInitializedRef = useRef(false);

  // Initialize filters from URL
  useEffect(() => {
    const entityId = searchParams.get('entityId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const success = searchParams.get('success');
    const search = searchParams.get('search');
    const actionType = searchParams.get('actionType');
    const isAdminAction = searchParams.get('isAdminAction');
    const isSystem = searchParams.get('isSystem');

    if (entityId) setEntityIdInput(entityId);
    if (success) setSuccessFilter(success);
    if (search) setSearchInput(search);
    if (actionType) setActionTypeFilter(actionType);
    if (isAdminAction) setIsAdminActionFilter(isAdminAction);
    if (isSystem) setIsSystemFilter(isSystem);

    const normalizedFrom = dateFrom
      ? clampDateValue(dateFrom, minDate, todayDate)
      : minDateString;
    const minForTo = parseDateValue(normalizedFrom) ?? minDate;
    const normalizedTo = dateTo
      ? clampDateValue(dateTo, minForTo, todayDate)
      : todayString;

    setDateFromInput(normalizedFrom);
    setDateToInput(normalizedTo);
    lastAppliedDatesRef.current = {
      from: normalizedFrom,
      to: normalizedTo,
    };
  }, [searchParams, minDate, todayDate, minDateString, todayString]);

  const buildFilters = useCallback(
    (overrides?: Partial<AuditLogFilters>): AuditLogFilters => {
      const effectivePage = overrides?.page ?? 1;
      const effectiveLimit = overrides?.limit ?? limit;

      const filters: AuditLogFilters = {
        page: effectivePage,
        limit: effectiveLimit,
      };

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

      const searchValue = (overrides?.search !== undefined ? overrides.search : searchInput)?.trim();
      if (searchValue) {
        filters.search = searchValue;
      }

      // Handle isAdminAction filter: overrides can be boolean, state is string
      if (overrides?.isAdminAction !== undefined) {
        filters.isAdminAction = overrides.isAdminAction;
      } else if (isAdminActionFilter && isAdminActionFilter !== 'all') {
        filters.isAdminAction = isAdminActionFilter === 'true';
      }

      const isSystemValue = overrides?.isSystem !== undefined ? overrides.isSystem : isSystemFilter;
      // Only include isSystem filter if explicitly set to 'true' or 'false' (not 'all')
      // If 'false', don't include the filter at all (show all events including system)
      if (isSystemValue && isSystemValue !== 'all' && isSystemValue !== 'false') {
        filters.isSystem = isSystemValue === 'true';
      }

      return filters;
    },
    [
      entityIdInput,
      actionTypeFilter,
      dateFromInput,
      dateToInput,
      successFilter,
      searchInput,
      isAdminActionFilter,
      isSystemFilter,
      limit,
    ]
  );

  const applyFilters = useCallback(
    (overrides?: Partial<AuditLogFilters>) => {
      const filters = buildFilters(overrides);
      lastAppliedDatesRef.current = {
        from: filters.dateFrom ?? '',
        to: filters.dateTo ?? '',
      };
      // Defer fetchAuditLogs to prevent setState during render
      setTimeout(() => {
        fetchAuditLogs(filters);
      }, 0);
      updateUrlWithFilters(filters);
    },
    [buildFilters, fetchAuditLogs]
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

    applyFilters({
      page: 1,
      dateFrom: sanitizedFrom || undefined,
      dateTo: sanitizedTo || undefined,
    });
  }, [applyFilters, dateFromInput, dateToInput, minDate, minDateString, todayDate, todayString]);

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

    const { from: lastFrom, to: lastTo } = lastAppliedDatesRef.current;

    if (sanitizedFrom === lastFrom && sanitizedTo === lastTo) {
      return;
    }

    lastAppliedDatesRef.current = {
      from: sanitizedFrom,
      to: sanitizedTo,
    };

    applyFilters({
      page: 1,
      dateFrom: sanitizedFrom || undefined,
      dateTo: sanitizedTo || undefined,
    });
  }, [applyFilters, dateFromInput, dateToInput, minDate, minDateString, todayDate, todayString]);

  const handleEntityIdBlur = useCallback(() => {
    const trimmedValue = entityIdInput.trim();
    const parsedValue = trimmedValue ? parseInt(trimmedValue, 10) : undefined;

    const normalizedValue = Number.isNaN(parsedValue) ? undefined : parsedValue;
    if (normalizedValue === appliedFilters.entityId) {
      return;
    }

    applyFilters({
      page: 1,
      entityId: normalizedValue,
    });
  }, [entityIdInput, appliedFilters.entityId, applyFilters]);

  // Initial load
  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;
    const initialFilters = buildFilters({ page, limit });
    fetchAuditLogs(initialFilters);
    updateUrlWithFilters(initialFilters);
  }, [buildFilters, fetchAuditLogs, limit, page]);

  // Debounced search for text inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters({ page: 1 });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    searchInput,
    applyFilters,
  ]);

  const handlePageChange = (newPage: number) => {
    applyFilters({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    applyFilters({ page: 1, limit: newPageSize });
  };

  const handleClearFilters = () => {
    // Clear all state first
    setEntityIdInput('');
    setActionTypeFilter('all');
    setDateFromInput(minDateString);
    setDateToInput(todayString);
    setSuccessFilter('all');
    setSearchInput('');
    setIsAdminActionFilter('all');
    setIsSystemFilter('all');
    
    // Apply filters with explicit undefined values to clear them
    // Pass empty object to bypass buildFilters and use only what we pass
    // Defer fetchAuditLogs to prevent setState during render
    setTimeout(() => {
      fetchAuditLogs({ 
        page: 1, 
        limit: 20,
        entityId: undefined,
        actionType: undefined,
        dateFrom: minDateString,
        dateTo: todayString,
        success: undefined,
        search: undefined,
        isAdminAction: undefined,
        isSystem: undefined,
      });
    }, 0);
    lastAppliedDatesRef.current = {
      from: minDateString,
      to: todayString,
    };
    updateUrlWithFilters({ page: 1, limit: 20, dateFrom: minDateString, dateTo: todayString });
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailDialog(true);
  };

  if (isLoading && auditLogs.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 px-6 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / limit)} • Total: {total} logs
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <IconX className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <Label htmlFor="search" className="text-sm font-medium whitespace-nowrap">
              Search:
            </Label>
            <Input
              id="search"
              type="text"
              placeholder="Search in descriptions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="entityId" className="text-sm font-medium whitespace-nowrap">
              Entity ID:
            </Label>
            <Input
              id="entityId"
              type="number"
              placeholder="Entity ID"
              value={entityIdInput}
              onChange={(e) => setEntityIdInput(e.target.value)}
              onBlur={handleEntityIdBlur}
              className="w-32"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="actionType" className="text-sm font-medium whitespace-nowrap">
              Action Type:
            </Label>
            <Select
              value={actionTypeFilter}
              onValueChange={(value) => {
                setActionTypeFilter(value);
                setTimeout(() => {
                  applyFilters({ page: 1, actionType: value === 'all' ? undefined : value });
                }, 0);
              }}
            >
              <SelectTrigger id="actionType" className="w-48">
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
            <Label htmlFor="success" className="text-sm font-medium whitespace-nowrap">
              Status:
            </Label>
            <Select
              value={successFilter}
              onValueChange={(value) => {
                setSuccessFilter(value);
                setTimeout(() => {
                  applyFilters({ page: 1, success: value === 'all' ? undefined : value === 'true' });
                }, 0);
              }}
            >
              <SelectTrigger id="success" className="w-32">
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
            <Label htmlFor="isAdminAction" className="text-sm font-medium whitespace-nowrap">
              Action Type:
            </Label>
            <Select
              value={isAdminActionFilter}
              onValueChange={(value) => {
                setIsAdminActionFilter(value);
                setTimeout(() => {
                  applyFilters({ page: 1, isAdminAction: value === 'all' ? undefined : value === 'true' });
                }, 0);
              }}
            >
              <SelectTrigger id="isAdminAction" className="w-40">
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
            <Label htmlFor="isSystem" className="text-sm font-medium whitespace-nowrap">
              System Events:
            </Label>
            <Select
              value={isSystemFilter}
              onValueChange={(value) => {
                setIsSystemFilter(value);
                // If 'false' or 'all', don't filter (show all events)
                // Only filter when explicitly set to 'true' (show only system events)
                setTimeout(() => {
                  applyFilters({ page: 1, isSystem: value === 'true' ? true : undefined });
                }, 0);
              }}
            >
              <SelectTrigger id="isSystem" className="w-40">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Show Only</SelectItem>
                <SelectItem value="false">Hide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="dateFrom" className="text-sm font-medium whitespace-nowrap">
                From:
              </Label>
              <div className="relative w-48">
                <Input
                  id="dateFrom"
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
              <Label htmlFor="dateTo" className="text-sm font-medium whitespace-nowrap">
                To:
              </Label>
              <div className="relative w-48">
                <Input
                  id="dateTo"
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
        </div>

        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <AuditLogsDataTable
            data={auditLogs}
            total={total}
            page={page}
            limit={limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
          />
        </div>

        <AuditLogDetailDialog
          log={selectedLog}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />
      </div>
    </div>
  );
}

