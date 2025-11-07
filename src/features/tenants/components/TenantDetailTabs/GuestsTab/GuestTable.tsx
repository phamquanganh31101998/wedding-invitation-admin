'use client';

import { Table, Tag, Button, Space, Tooltip, Empty, Card, Skeleton } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { IGuest } from '@/features/guests/services';

interface GuestTableProps {
  tenantId: number;
  guests: IGuest[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (guest: IGuest) => void;
  onDelete: (guest: IGuest) => void;
}

// Create skeleton guest data for loading state
const createSkeletonGuest = (index: number): IGuest => ({
  id: -index, // Negative IDs for skeleton rows
  tenantId: 0,
  name: '',
  relationship: '',
  attendance: 'maybe' as const,
  message: '',
  createdAt: '',
  updatedAt: '',
});

export default function GuestTable({
  guests,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onEdit,
  onDelete,
}: GuestTableProps) {
  // Get attendance tag color
  const getAttendanceColor = (attendance: string) => {
    switch (attendance) {
      case 'yes':
        return 'green';
      case 'no':
        return 'red';
      case 'maybe':
        return 'orange';
      default:
        return 'default';
    }
  };

  // Get attendance label
  const getAttendanceLabel = (attendance: string) => {
    switch (attendance) {
      case 'yes':
        return 'Yes';
      case 'no':
        return 'No';
      case 'maybe':
        return 'Maybe';
      default:
        return attendance;
    }
  };

  // Check if we're showing skeleton rows
  const isShowingSkeleton = isLoading && guests.length === 0;

  // Table columns
  const columns: ColumnsType<IGuest> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      ellipsis: {
        showTitle: false,
      },
      width: '20%',
      render: (name: string, record) =>
        record.id < 0 ? (
          <Skeleton.Input active size="small" style={{ width: 120 }} />
        ) : (
          <Tooltip placement="topLeft" title={name}>
            <span style={{ fontWeight: 500 }}>{name}</span>
          </Tooltip>
        ),
    },
    {
      title: 'Relationship',
      dataIndex: 'relationship',
      key: 'relationship',
      sorter: true,
      ellipsis: {
        showTitle: false,
      },
      width: '15%',
      render: (relationship: string, record) =>
        record.id < 0 ? (
          <Skeleton.Input active size="small" style={{ width: 100 }} />
        ) : (
          <Tooltip placement="topLeft" title={relationship}>
            {relationship}
          </Tooltip>
        ),
    },
    {
      title: 'Attendance',
      dataIndex: 'attendance',
      key: 'attendance',
      sorter: true,
      width: '12%',
      render: (attendance: string, record) =>
        record.id < 0 ? (
          <Skeleton.Button active size="small" style={{ width: 60 }} />
        ) : (
          <Tag color={getAttendanceColor(attendance)}>
            {getAttendanceLabel(attendance)}
          </Tag>
        ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: {
        showTitle: false,
      },
      width: '25%',
      render: (message: string | undefined, record) =>
        record.id < 0 ? (
          <Skeleton.Input active size="small" style={{ width: 200 }} />
        ) : message ? (
          <Tooltip placement="topLeft" title={message}>
            <span>{message}</span>
          </Tooltip>
        ) : (
          <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>No message</span>
        ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      width: '13%',
      responsive: ['md'],
      render: (date: string, record) =>
        record.id < 0 ? (
          <Skeleton.Input active size="small" style={{ width: 90 }} />
        ) : (
          <Tooltip title={dayjs(date).format('MMMM DD, YYYY HH:mm')}>
            {dayjs(date).format('MMM DD, YYYY')}
          </Tooltip>
        ),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      width: '13%',
      responsive: ['lg'],
      render: (date: string, record) =>
        record.id < 0 ? (
          <Skeleton.Input active size="small" style={{ width: 90 }} />
        ) : (
          <Tooltip title={dayjs(date).format('MMMM DD, YYYY HH:mm')}>
            {dayjs(date).format('MMM DD, YYYY')}
          </Tooltip>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) =>
        record.id < 0 ? (
          <Skeleton.Button active size="small" style={{ width: 80 }} />
        ) : (
          <Space size="small">
            <Tooltip title="Edit guest information">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Delete guest">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record)}
                size="small"
              />
            </Tooltip>
          </Space>
        ),
    },
  ];

  // Generate skeleton rows when loading
  const displayData = isLoading && guests.length === 0
    ? Array.from({ length: limit }, (_, i) => createSkeletonGuest(i + 1))
    : guests;

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={displayData}
        rowKey="id"
        loading={isLoading && guests.length > 0} // Show spinner only when refreshing existing data
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} guest${total !== 1 ? 's' : ''}`,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
          pageSizeOptions: ['10', '20', '50', '100'],
          responsive: true,
        }}
        locale={{
          emptyText: (
            <Empty
              description={
                <Space direction="vertical" size={4}>
                  <span style={{ fontSize: 16, fontWeight: 500 }}>
                    No guests found
                  </span>
                  <span style={{ color: '#8c8c8c', fontSize: 14 }}>
                    Click &quot;Add Guest&quot; to create your first guest entry
                  </span>
                </Space>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '40px 0' }}
            />
          ),
        }}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
}
