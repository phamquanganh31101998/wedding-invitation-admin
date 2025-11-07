'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Space, Input, Select, Row, Col, Card, Modal, message, Alert, Tooltip } from 'antd';
import {
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useModal } from '@ebay/nice-modal-react';
import { useGetGuestList, useExportGuests, useDeleteGuest } from '@/features/guests/services';
import { IGuest, IGuestListParams } from '@/features/guests/services';
import GuestStatistics from './GuestStatistics';
import GuestTable from './GuestTable';
import GuestFormModal from './GuestFormModal';
import GuestImportModal from './GuestImportModal';
import styles from './GuestsTab.module.css';

const { Search } = Input;

interface GuestsTabProps {
  tenantId: number;
}

export default function GuestsTab({ tenantId }: GuestsTabProps) {
  // State for pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // State for filters
  const [searchInput, setSearchInput] = useState<string>(''); // Local input state
  const [search, setSearch] = useState<string>(''); // Debounced search value
  const [attendanceFilter, setAttendanceFilter] = useState<
    'yes' | 'no' | 'maybe' | undefined
  >(undefined);

  // Modals
  const guestFormModal = useModal(GuestFormModal);
  const guestImportModal = useModal(GuestImportModal);

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

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

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  // Handle search button click (immediate search)
  const handleSearchSubmit = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  // Handle attendance filter change
  const handleAttendanceFilterChange = (
    value: 'yes' | 'no' | 'maybe' | undefined
  ) => {
    setAttendanceFilter(value);
    setPage(1); // Reset to first page on filter change
  };

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
    Modal.confirm({
      title: 'Delete Guest',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to delete this guest?</p>
          <p style={{ marginTop: 8 }}>
            <strong>Name:</strong> {guest.name}
            <br />
            <strong>Relationship:</strong> {guest.relationship}
          </p>
          <p style={{ color: '#ff4d4f', marginTop: 8 }}>
            This action cannot be undone.
          </p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteGuest(guest.id);
          refetch();
        } catch (error) {
          console.error('Delete failed:', error);
          // Error message is handled in the hook
        }
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

      {/* Actions and Filters */}
      <Card style={{ marginTop: 24, marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={24} lg={14} xl={14}>
            <Space
              direction="horizontal"
              style={{ width: '100%' }}
              wrap
              size={[8, 8]}
            >
              <Search
                placeholder="Search by name or relationship"
                allowClear
                value={searchInput}
                onSearch={handleSearchSubmit}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{ minWidth: 200, maxWidth: 300, width: '100%' }}
                prefix={<SearchOutlined />}
                enterButton
              />
              <Select
                placeholder="Filter by attendance"
                allowClear
                style={{ minWidth: 160, width: 180 }}
                onChange={handleAttendanceFilterChange}
                value={attendanceFilter}
                options={[
                  { label: 'Attending (Yes)', value: 'yes' },
                  { label: 'Not Attending (No)', value: 'no' },
                  { label: 'Maybe', value: 'maybe' },
                ]}
              />
            </Space>
          </Col>
          <Col xs={24} sm={24} md={24} lg={10} xl={10}>
            <Space
              direction="horizontal"
              style={{
                width: '100%',
                justifyContent: 'flex-end',
              }}
              wrap
              size={[8, 8]}
            >
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
                <Button
                  icon={<ImportOutlined />}
                  onClick={handleImport}
                >
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
          </Col>
        </Row>
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
