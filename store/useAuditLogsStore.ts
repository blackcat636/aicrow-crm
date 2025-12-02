import { create } from 'zustand';
import { getAllAuditLogs, getAuditLogsByUserId } from '@/lib/api/audit-logs';
import { AuditLog, AvailableFilters, AuditLogFilters } from '@/interface/AuditLog';

const MERGEABLE_FILTER_KEYS: ReadonlyArray<
  Exclude<keyof AuditLogFilters, 'userId' | 'userEmail' | 'page' | 'limit'>
> = [
  'entityType',
  'entityId',
  'actionType',
  'actionCategory',
  'dateFrom',
  'dateTo',
  'success',
  'search',
  'isAdminAction',
  'isSystem',
];

type MergeableKey = (typeof MERGEABLE_FILTER_KEYS)[number];
type MergeableFiltersMap = Partial<Record<MergeableKey, AuditLogFilters[MergeableKey]>>;

interface AuditLogsStore {
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  availableFilters: AvailableFilters | null;
  filters: Omit<AuditLogFilters, 'page' | 'limit'>;
  fetchAuditLogs: (filters?: AuditLogFilters) => Promise<void>;
  fetchAuditLogsByUserId: (
    userId: number,
    filters?: Omit<AuditLogFilters, 'userId'>
  ) => Promise<void>;
}

export const useAuditLogsStore = create<AuditLogsStore>((set, get) => ({
  auditLogs: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  availableFilters: null,
  filters: {},

  fetchAuditLogs: async (filters: AuditLogFilters = {}) => {
    // Use current state as defaults if params not provided
    const currentPage = filters.page ?? get().page;
    const currentLimit = filters.limit ?? get().limit;
    const currentFilters = get().filters;

    // Check if we're clearing filters (if any filter is explicitly set to undefined)
    const isClearingFilters = 
      filters.userId === undefined ||
      filters.userEmail === undefined ||
      filters.entityType === undefined ||
      filters.entityId === undefined ||
      filters.actionType === undefined ||
      filters.actionCategory === undefined ||
      filters.dateFrom === undefined ||
      filters.dateTo === undefined ||
      filters.success === undefined ||
      filters.search === undefined ||
      filters.isAdminAction === undefined ||
      filters.isSystem === undefined;

    // Merge filters - only use currentFilters for filters that are not explicitly provided
    // This prevents old entityId from being added when only userId is provided
    const mergedFilters: AuditLogFilters = {
      page: currentPage,
      limit: currentLimit,
    };

    // Only merge currentFilters if we're not clearing and the filter is not explicitly provided
    if (!isClearingFilters) {
      if (filters.userId === undefined && currentFilters.userId !== undefined) {
        mergedFilters.userId = currentFilters.userId;
      }
      if (filters.userEmail === undefined && currentFilters.userEmail !== undefined) {
        mergedFilters.userEmail = currentFilters.userEmail;
      }
      if (filters.entityType === undefined && currentFilters.entityType !== undefined) {
        mergedFilters.entityType = currentFilters.entityType;
      }
      if (filters.entityId === undefined && currentFilters.entityId !== undefined) {
        mergedFilters.entityId = currentFilters.entityId;
      }
      if (filters.actionType === undefined && currentFilters.actionType !== undefined) {
        mergedFilters.actionType = currentFilters.actionType;
      }
      if (filters.actionCategory === undefined && currentFilters.actionCategory !== undefined) {
        mergedFilters.actionCategory = currentFilters.actionCategory;
      }
      if (filters.dateFrom === undefined && currentFilters.dateFrom !== undefined) {
        mergedFilters.dateFrom = currentFilters.dateFrom;
      }
      if (filters.dateTo === undefined && currentFilters.dateTo !== undefined) {
        mergedFilters.dateTo = currentFilters.dateTo;
      }
      if (filters.success === undefined && currentFilters.success !== undefined) {
        mergedFilters.success = currentFilters.success;
      }
      if (filters.search === undefined && currentFilters.search !== undefined) {
        mergedFilters.search = currentFilters.search;
      }
      if (filters.isAdminAction === undefined && currentFilters.isAdminAction !== undefined) {
        mergedFilters.isAdminAction = currentFilters.isAdminAction;
      }
      if (filters.isSystem === undefined && currentFilters.isSystem !== undefined) {
        mergedFilters.isSystem = currentFilters.isSystem;
      }
    }

    // Apply explicitly provided filters (they override currentFilters)
    Object.assign(mergedFilters, filters);

    // Remove undefined values to clear filters
    if (mergedFilters.userId === undefined) delete mergedFilters.userId;
    if (mergedFilters.userEmail === undefined) delete mergedFilters.userEmail;
    if (mergedFilters.entityType === undefined) delete mergedFilters.entityType;
    if (mergedFilters.entityId === undefined) delete mergedFilters.entityId;
    if (mergedFilters.actionType === undefined) delete mergedFilters.actionType;
    if (mergedFilters.actionCategory === undefined)
      delete mergedFilters.actionCategory;
    if (mergedFilters.dateFrom === undefined) delete mergedFilters.dateFrom;
    if (mergedFilters.dateTo === undefined) delete mergedFilters.dateTo;
    if (mergedFilters.success === undefined) delete mergedFilters.success;
    if (mergedFilters.search === undefined) delete mergedFilters.search;
    if (mergedFilters.isAdminAction === undefined)
      delete mergedFilters.isAdminAction;
    if (mergedFilters.isSystem === undefined) delete mergedFilters.isSystem;

    set({ isLoading: true, error: null });
    try {
      const response = await getAllAuditLogs(mergedFilters);

      if ((response.status === 200 || response.status === 0) && response.data) {
        // Extract filters without page and limit for storage
        const { page: _, limit: __, ...filterState } = mergedFilters;

        set({
          auditLogs: response.data.items,
          total: response.data.total,
          page: response.data.page || currentPage,
          limit: response.data.limit || currentLimit,
          totalPages: response.data.totalPages,
          availableFilters: response.data.availableFilters,
          filters: filterState,
        });
      } else {
        console.error('❌ [store.fetchAuditLogs] API returned error:', {
          status: response.status,
          message: response.message,
        });
        set({ error: response.message || 'Error loading audit logs' });
      }
    } catch (error) {
      console.error('❌ [store.fetchAuditLogs] Exception:', error);
      set({ error: error instanceof Error ? error.message : 'Error loading audit logs' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAuditLogsByUserId: async (
    userId: number,
    filters: Omit<AuditLogFilters, 'userId' | 'userEmail'> = {}
  ) => {
    // Use current state as defaults if params not provided
    const currentPage = filters.page ?? get().page;
    const currentLimit = filters.limit ?? get().limit;

    // Determine if we are explicitly clearing filters
    const isClearingFilters = Object.values(filters).some(value => value === undefined);

    // Start with page and limit, don't merge with currentFilters to avoid conflicts
    const mergedFilters: Omit<AuditLogFilters, 'userId' | 'userEmail'> = {
      page: currentPage,
      limit: currentLimit,
    };

    // Only merge currentFilters if we're not clearing and the filter is not explicitly provided
    if (!isClearingFilters) {
      const currentFilters = get().filters;
      const preservedFilters = MERGEABLE_FILTER_KEYS.reduce<MergeableFiltersMap>(
        (acc, key) => {
          const currentValue = currentFilters[key];

          if (filters[key] === undefined && currentValue !== undefined) {
            acc[key] = currentValue;
          }

          return acc;
        },
        {}
      );

      Object.assign(mergedFilters, preservedFilters);
    }
    // Always apply new filters, overriding existing ones
    Object.assign(mergedFilters, filters);

    // Remove userId and userEmail from merged filters if present
    if ('userId' in mergedFilters) {
      delete (mergedFilters as any).userId;
    }
    if ('userEmail' in mergedFilters) {
      delete (mergedFilters as any).userEmail;
    }

    // Remove undefined values to clear filters
    for (const key of Object.keys(mergedFilters) as Array<
      keyof typeof mergedFilters
    >) {
      if (mergedFilters[key] === undefined) {
        delete mergedFilters[key];
      }
    }

    set({ isLoading: true, error: null });
    try {
      const response = await getAuditLogsByUserId(userId, mergedFilters);

      if ((response.status === 200 || response.status === 0) && response.data) {
        // Extract filters without page and limit for storage
        const { page: _, limit: __, ...filterState } = mergedFilters;

        set({
          auditLogs: response.data.items,
          total: response.data.total,
          page: response.data.page || currentPage,
          limit: response.data.limit || currentLimit,
          totalPages: response.data.totalPages,
          availableFilters: response.data.availableFilters,
          // Don't update global filters when fetching by userId to avoid conflicts
          // filters: filterState,
        });
      } else {
        console.error('❌ [store.fetchAuditLogsByUserId] API returned error:', {
          status: response.status,
          message: response.message,
        });
        set({ error: response.message || 'Error loading audit logs' });
      }
    } catch (error) {
      console.error('❌ [store.fetchAuditLogsByUserId] Exception:', error);
      set({ error: error instanceof Error ? error.message : 'Error loading audit logs' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
