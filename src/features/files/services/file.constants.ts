// Query keys factory
export const fileKeys = {
  all: ['files'] as const,
  listAllByTenant: (tenantId: number) => [...fileKeys.all, tenantId] as const,
  listByTenant: (tenantId: number, params: any) =>
    [...fileKeys.listAllByTenant(tenantId), params] as const,
};
