'use client';

import { Tabs } from 'antd';
import { TenantUI } from '@/types/tenant';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import OverviewTab from './OverviewTab/OverviewTab';
import ThemeTab from './ThemeTab/ThemeTab';
import SettingsTab from './SettingsTab/SettingsTab';
import FilesTab from './FilesTab/FilesTab';
import GuestsTab from './GuestsTab/GuestsTab';

interface TenantDetailTabsProps {
  tenant: TenantUI;
  editingField: string | null;
  editingValues: Record<string, any>;
  saving: boolean;
  onStartEditing: (field: string, currentValue: any) => void;
  onCancelEditing: () => void;
  onUpdateEditingValue: (field: string, value: any) => void;
  onSaveFieldUpdate: (field: string, value: any) => Promise<void>;
  onUpdateTenantStatus: (isActive: boolean) => Promise<void>;
  onRefreshTenant?: () => void;
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
  onRefreshTenant,
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
      label: 'Theme',
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
      key: 'files',
      label: 'Files',
      children: (
        <FilesTab
          tenant={tenant}
          onFileUploadSuccess={onRefreshTenant}
        />
      ),
    },
    {
      key: 'guests',
      label: 'Guests',
      children: (
        <ErrorBoundary>
          <GuestsTab tenantId={tenant.id} />
        </ErrorBoundary>
      ),
    },
    {
      key: 'settings',
      label: 'Settings',
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