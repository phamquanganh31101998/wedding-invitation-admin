'use client';

import { Tabs } from 'antd';
import { Tenant } from '@/types/tenant';
import OverviewTab from './OverviewTab/OverviewTab';
import ThemeTab from './ThemeTab/ThemeTab';
import SettingsTab from './SettingsTab/SettingsTab';

interface TenantDetailTabsProps {
  tenant: Tenant;
  editingField: string | null;
  editingValues: Record<string, any>;
  saving: boolean;
  onStartEditing: (field: string, currentValue: any) => void;
  onCancelEditing: () => void;
  onUpdateEditingValue: (field: string, value: any) => void;
  onSaveFieldUpdate: (field: string, value: any) => Promise<void>;
  onUpdateTenantStatus: (isActive: boolean) => Promise<void>;
}

export default function TenantDetailTabs({
  tenant,
  editingField,
  editingValues,
  saving,
  onStartEditing,
  onCancelEditing,
  onUpdateEditingValue,
  onSaveFieldUpdate,
  onUpdateTenantStatus,
}: TenantDetailTabsProps) {
  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <OverviewTab
          tenant={tenant}
          editingField={editingField}
          editingValues={editingValues}
          saving={saving}
          onStartEditing={onStartEditing}
          onCancelEditing={onCancelEditing}
          onUpdateEditingValue={onUpdateEditingValue}
          onSaveFieldUpdate={onSaveFieldUpdate}
        />
      ),
    },
    {
      key: 'theme',
      label: 'Theme Configuration',
      children: (
        <ThemeTab
          tenant={tenant}
          editingField={editingField}
          editingValues={editingValues}
          saving={saving}
          onStartEditing={onStartEditing}
          onCancelEditing={onCancelEditing}
          onUpdateEditingValue={onUpdateEditingValue}
          onSaveFieldUpdate={onSaveFieldUpdate}
        />
      ),
    },
    {
      key: 'settings',
      label: 'Status & Settings',
      children: (
        <SettingsTab
          tenant={tenant}
          saving={saving}
          onUpdateTenantStatus={onUpdateTenantStatus}
        />
      ),
    },
  ];

  return (
    <Tabs
      defaultActiveKey="overview"
      type="card"
      items={tabItems}
    />
  );
}