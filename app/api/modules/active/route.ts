import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { isAuthenticatedServer, refreshAccessToken } from '@/lib/auth';
import { Module, ModulesResponse } from '@/interface/Module';

export const runtime = 'edge';

// Mock data for active modules - in real implementation this would come from your NestJS backend
const ACTIVE_MODULES = [
  {
    key: 'users',
    name: 'Users',
    routes: ['/users'],
    icon: 'IconUsers',
    menu: true,
    order: 1,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: false
    },
    subItems: [
      {
        title: 'Users',
        url: '/users',
        icon: 'IconUsers'
      },
      {
        title: 'All Logs',
        url: '/audit-logs',
        icon: 'IconHistory'
      }
    ]
  },
  {
    key: 'automations',
    name: 'Automations',
    routes: ['/workflows'],
    icon: 'IconSettings',
    menu: true,
    order: 2,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: false
    },
    subItems: [
      {
        title: 'Workflows',
        url: '/workflows',
        icon: 'IconSettings'
      },
      {
        title: 'User Workflows',
        url: '/user-workflows',
        icon: 'IconUsers'
      },
      {
        title: 'Executions',
        url: '/executions',
        icon: 'IconListDetails'
      },
      {
        title: 'Instances',
        url: '/instances',
        icon: 'IconListDetails'
      }
    ]
  },
  {
    key: 'balance',
    name: 'Balance Management',
    routes: ['/balance'],
    icon: 'IconCoins',
    menu: true,
    order: 3,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: false
    },
    subItems: [
      {
        title: 'Admin Deposit',
        url: '/balance/admin-deposit',
        icon: 'IconCoins'
      },
      {
        title: 'Users with Balances',
        url: '/balance/users',
        icon: 'IconUsers'
      }
    ]
  },
  {
    key: 'permissions',
    name: 'Roles & Permissions',
    routes: ['/permissions'],
    icon: 'IconShield',
    menu: true,
    order: 4,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: true
    }
  },
  {
    key: 'subscription-plans',
    name: 'Subscription Plans',
    routes: ['/plans'],
    icon: 'IconCreditCard',
    menu: true,
    order: 5,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: false
    }
  },
  {
    key: 'documentation',
    name: 'Documentation',
    routes: ['/documentation'],
    icon: 'IconFileDescription',
    menu: true,
    order: 6,
    permissions: {
      can_view: true,
      can_edit: false,
      can_delete: false
    }
  }
];

const normalizeModules = (input: unknown): Module[] => {
  const list = Array.isArray(input)
    ? input
    : (input as { data?: unknown })?.data;

  if (!Array.isArray(list)) {
    return [];
  }

  return (list as Module[]).map((module) => {
    const subItemRoutes = module.subItems?.map((s) => s.url) ?? [];
    const routes = Array.from(new Set([...(module.routes ?? []), ...subItemRoutes]));
    const permissions =
      module.permissions ??
      ({
        can_view: true,
        can_edit: true,
        can_delete: true
      } satisfies Module['permissions']);

    return {
      ...module,
      routes,
      permissions,
      subItems: module.subItems?.map((s) => ({
        ...s,
        permissions: s.permissions ?? permissions
      }))
    };
  });
};

const coerceNumericUserId = (value: unknown): number | null => {
  const num = typeof value === 'string' ? Number(value) : (value as number);
  if (!Number.isFinite(num)) return null;
  if (num <= 0) return null;
  return num;
};

const extractNumericUserIdFromJwt = (token: string): number | null => {
  try {
    const decoded = jose.decodeJwt(token) as unknown;
    if (!decoded || typeof decoded !== "object") return null;
    const obj = decoded as Record<string, unknown>;
    const nestedUser = obj.user;
    const nestedUserId =
      nestedUser && typeof nestedUser === "object"
        ? (nestedUser as Record<string, unknown>).id
        : null;

    const candidates: unknown[] = [obj.id, obj.userId, nestedUserId, obj.sub];

    for (const v of candidates) {
      const n = coerceNumericUserId(v);
      if (n) return n;
    }

    return null;
  } catch {
    return null;
  }
};

type PermissionPatch = { can_view: boolean; can_edit: boolean; can_delete: boolean };

const denyAll: PermissionPatch = { can_view: false, can_edit: false, can_delete: false };

const removeSubItemFromModule = (modules: Module[], moduleKey: string, subItemUrl: string) => {
  const mod = modules.find((m) => m.key === moduleKey);
  if (!mod) return;

  if (mod.subItems?.length) {
    mod.subItems = mod.subItems.filter((s) => s.url !== subItemUrl);
  }

  if (mod.routes?.length) {
    mod.routes = mod.routes.filter((r) => r !== subItemUrl);
  }
};

const ensureAuditLogsModule = (modules: Module[], canView: boolean) => {
  // Avoid duplicates.
  if (modules.some((m) => m.key === "audit-logs")) return;

  modules.unshift({
    key: "audit-logs",
    name: "Audit Logs",
    routes: ["/audit-logs"],
    icon: "IconHistory",
    menu: true,
    order: 2, // After Users (1) but before Automations (2) in the mock; ordering will be normalized by sort in UI anyway.
    permissions: canView ? { can_view: true, can_edit: false, can_delete: false } : denyAll,
    subItems: [
      {
        title: "Audit Logs",
        url: "/audit-logs",
        icon: "IconHistory",
        permissions: canView ? { can_view: true, can_edit: false, can_delete: false } : denyAll
      }
    ]
  });
};

const applyModulePatch = (modules: Module[], moduleKey: string, patch: PermissionPatch) => {
  const mod = modules.find((m) => m.key === moduleKey);
  if (!mod) return;
  mod.permissions = { ...mod.permissions, ...patch };
  if (mod.subItems) {
    mod.subItems = mod.subItems.map((s) => ({
      ...s,
      permissions: { ...(s.permissions ?? mod.permissions), ...patch }
    }));
  }
};

const applySubItemPatch = (
  modules: Module[],
  moduleKey: string,
  subItemUrl: string,
  patch: PermissionPatch
) => {
  const mod = modules.find((m) => m.key === moduleKey);
  if (!mod || !mod.subItems) return;

  mod.subItems = mod.subItems.map((s) => {
    if (s.url !== subItemUrl) return s;
    return {
      ...s,
      permissions: { ...(s.permissions ?? mod.permissions), ...patch }
    };
  });

  // If all sub-items are denied, deny the module too (keeps menu clean).
  const anyVisible =
    mod.subItems.some((s) => (s.permissions?.can_view ?? mod.permissions.can_view) === true);
  if (!anyVisible) {
    mod.permissions = { ...mod.permissions, ...patch };
  }
};

const safeProbe = async (url: string, token: string): Promise<number> => {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    return res.status;
  } catch {
    // Network errors should not block UI. Treat as "unknown", i.e. don't change permissions.
    return 0;
  }
};

const probeAndPatchModules = async (modules: Module[], token: string, apiUrl: string) => {
  if (!token) return;

  const userId = extractNumericUserIdFromJwt(token);

  const auditStatus = await safeProbe(`${apiUrl}/admin/audit-logs?page=1&limit=1`, token);
  if (auditStatus > 0 && auditStatus !== 404) {
    const canViewAuditLogs = auditStatus !== 403 && auditStatus !== 401;
    if (canViewAuditLogs) {
      removeSubItemFromModule(modules, 'users', '/audit-logs');
      ensureAuditLogsModule(modules, true);
    }
  }

  if (modules.find((m) => m.key === 'users')?.permissions?.can_view) {
    const status = await safeProbe(`${apiUrl}/admin/users?page=1&limit=1`, token);
    if (status === 403) applyModulePatch(modules, 'users', denyAll);
  }

  if (modules.find((m) => m.key === 'automations')?.permissions?.can_view) {
    const [wf, uw, ex, inst] = await Promise.all([
      safeProbe(`${apiUrl}/admin/automations/workflows?page=1&limit=1&show=true`, token),
      userId
        ? safeProbe(`${apiUrl}/admin/automations/users/${userId}/workflows?page=1&limit=1`, token)
        : Promise.resolve(0),
      safeProbe(`${apiUrl}/admin/automations/executions?page=1&limit=1`, token),
      safeProbe(`${apiUrl}/admin/automations/instances`, token)
    ]);

    if (wf === 403) applySubItemPatch(modules, 'automations', '/workflows', denyAll);
    if (uw === 403) applySubItemPatch(modules, 'automations', '/user-workflows', denyAll);
    if (ex === 403) applySubItemPatch(modules, 'automations', '/executions', denyAll);
    if (inst === 403) applySubItemPatch(modules, 'automations', '/instances', denyAll);
  }

  if (modules.find((m) => m.key === 'permissions')?.permissions?.can_view) {
    const status = await safeProbe(`${apiUrl}/admin/permissions/roles`, token);
    if (status === 403) applyModulePatch(modules, 'permissions', denyAll);
  }

  if (modules.find((m) => m.key === 'balance')?.permissions?.can_view) {
    const status = await safeProbe(`${apiUrl}/admin/balance/users`, token);
    if (status === 403) applySubItemPatch(modules, 'balance', '/balance/users', denyAll);
  }

  if (modules.find((m) => m.key === 'subscription-plans')?.permissions?.can_view) {
    const status = await safeProbe(`${apiUrl}/admin/subscription-plans?page=1&limit=1`, token);
    if (status === 403) applyModulePatch(modules, 'subscription-plans', denyAll);
  }
};

export async function GET(request: NextRequest) {
  try {
    let token = request.cookies.get('access_token')?.value || null;

    if (!token) {
      return NextResponse.json(
        {
          status: 401,
          message: 'Unauthorized'
        },
        { status: 401 }
      );
    }

    const valid = await isAuthenticatedServer(token);
    if (!valid) {
      const refreshRes = await refreshAccessToken(request);
      if (refreshRes) {
        token = refreshRes.cookies.get('access_token')?.value || token;
      } else {
        return NextResponse.json(
          {
            status: 401,
            message: 'Unauthorized'
          },
          { status: 401 }
        );
      }
    }

    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    // Try a couple of common backend routes. Prefer /admin/modules/active.
    const candidates = [`${API_URL}/admin/modules/active`, `${API_URL}/modules/active`];

    let upstream: Response | null = null;
    let lastJson: unknown = null;

    for (const url of candidates) {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        cache: 'no-store'
      });

      // If route doesn't exist, try next candidate.
      if (res.status === 404) {
        continue;
      }

      upstream = res;
      lastJson = await res.json().catch(() => null);
      break;
    }

    // Fallback to mock if backend route is not available (e.g. during local UI-only dev).
    if (!upstream) {
      const normalized = normalizeModules({ data: ACTIVE_MODULES });

      await probeAndPatchModules(normalized, token, API_URL);

      const response: ModulesResponse = {
        status: 200,
        data: normalized,
        message: 'Active modules retrieved successfully'
      };
      return NextResponse.json(response);
    }

    if (!upstream.ok) {
      return NextResponse.json(
        {
          status: upstream.status,
          message:
            (lastJson as { message?: string })?.message ||
            'Failed to fetch active modules'
        },
        { status: upstream.status }
      );
    }

    const normalized = normalizeModules(lastJson);

    // Server-side permission probing.
    // Goal: eliminate client-side 403 "noise" while still fail-closing the UI correctly.
    // If upstream doesn't include per-user permissions, we confirm access by probing a few
    // lightweight endpoints from the server (403 will not appear in browser console).
    await probeAndPatchModules(normalized, token, API_URL);

    const response: ModulesResponse = {
      status: 200,
      data: normalized,
      message: 'Active modules retrieved successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching active modules:', error);

    return NextResponse.json(
      {
        status: 500,
        error: 'Failed to fetch active modules',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
