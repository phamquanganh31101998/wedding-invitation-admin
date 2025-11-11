'use client';

import { useState, useCallback } from 'react';
import {
  Button,
  Space,
  Card,
  Alert,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useModal } from '@ebay/nice-modal-react';
import {
  useGetGuestList,
  useExportGuests,
  useDeleteGuest,
  IGuest,
  IGuestListParams,
} from '@/features/guests/services';
import GuestStatistics from '@/features/guests/components/GuestStatistics';
import GuestTable from '@/features/guests/components/GuestTable';
import GuestFormModal from '@/features/guests/components/GuestFormModal';
import GuestImportModal from '@/features/guests/components/GuestImportModal/GuestImportModal';
import ConfirmDeleteGuest from '@/features/guests/components/ConfirmDeleteGuest';
import GuestFilter from './GuestFilter';
import styles from './GuestsTab.module.css';

interface GuestsTabProps {
  tenantId: number;
}

export default function GuestsTab({ tenantId }: GuestsTabProps) {
  // State for pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // State for filters
  const [search, setSearch] = useState<string>('');
  const [attendanceFilter, setAttendanceFilter] = useState<
    'yes' | 'no' | 'maybe' | undefined
  >(undefined);

  // Modals
  const guestFormModal = useModal(GuestFormModal);
  const guestImportModal = useModal(GuestImportModal);
  const confirmDeleteModal = useModal(ConfirmDeleteGuest);

  // Build query params
  const queryParams: IGuestListParams = {
    page,
    limit,
    ...(search && { search }),
    ...(attendanceFilter && { attendance: attendanceFilter }),
  };

  // Fetch guest list
  const { guests, total, isLoading, error, refetch } = useGetGuestList(
    tenantId,
    queryParams
  );

  // Export guests hook
  const { exportGuests, isExporting } = useExportGuests(tenantId);

  // Delete guest hook
  const { deleteGuest, isDeleting } = useDeleteGuest(tenantId);

  // Handle filter changes
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleAttendanceChange = useCallback(
    (value: 'yes' | 'no' | 'maybe' | undefined) => {
      setAttendanceFilter(value);
      setPage(1);
    },
    []
  );

  // Handle pagination change
  const handlePageChange = (newPage: number, pageSize: number) => {
    setPage(newPage);
    setLimit(pageSize);
  };

  // Handle add guest
  const handleAddGuest = () => {
    guestFormModal.show({ tenantId, onSuccess: refetch });
  };

  // Handle edit guest
  const handleEditGuest = (guest: IGuest) => {
    guestFormModal.show({ tenantId, guest, onSuccess: refetch });
  };

  // Handle import
  const handleImport = () => {
    guestImportModal.show({ tenantId, onSuccess: refetch });
  };

  // Handle export
  const handleExport = async () => {
    try {
      // Apply current filters to export
      const exportParams: IGuestListParams = {
        ...(search && { search }),
        ...(attendanceFilter && { attendance: attendanceFilter }),
      };
      await exportGuests(exportParams);
    } catch (error) {
      console.error('Export failed:', error);
      // Error message is handled in the hook
    }
  };

  // Handle delete guest with confirmation
  const handleDeleteGuest = (guest: IGuest) => {
    confirmDeleteModal.show({
      guest,
      onConfirm: async () => {
        await deleteGuest(guest.id);
        refetch();
      },
    });
  };

  return (
    <div className={styles.fadeIn}>
      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Guests"
          description="Failed to load guest list. Please try again."
          type="error"
          showIcon
          closable
          action={
            <Button size="small" danger onClick={() => refetch()}>
              Retry
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Guest Statistics */}
      <GuestStatistics tenantId={tenantId} />

      {/* Filters and Actions */}
      <Card style={{ marginTop: 24, marginBottom: 16 }}>
        <Space
          direction="vertical"
          size={16}
          style={{ width: '100%', display: 'flex' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 300 }}>
              <GuestFilter
                onSearchChange={handleSearchChange}
                onAttendanceChange={handleAttendanceChange}
              />
            </div>
            <Space wrap size={[8, 8]}>
              <Tooltip title="Add a new guest to the list">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddGuest}
                >
                  Add Guest
                </Button>
              </Tooltip>
              <Tooltip title="Import guests from CSV or Excel file">
                <Button icon={<ImportOutlined />} onClick={handleImport}>
                  Import
                </Button>
              </Tooltip>
              <Tooltip title="Export guest list to Excel file">
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExport}
                  loading={isExporting}
                  disabled={isExporting}
                >
                  Export
                </Button>
              </Tooltip>
            </Space>
          </div>
        </Space>
      </Card>

      {/* Guest Table */}
      <GuestTable
        tenantId={tenantId}
        guests={guests}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading || isDeleting}
        onPageChange={handlePageChange}
        onEdit={handleEditGuest}
        onDelete={handleDeleteGuest}
      />
    </div>
  );
}
