import { Table, Tag, Tooltip, Button, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { TenantUI } from '@/types/tenant';

interface TenantListProps {
  tenants: TenantUI[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onTableChange: (page: number, pageSize: number) => void;
}

export default function TenantList({
  tenants,
  loading,
  currentPage,
  pageSize,
  total,
  onTableChange,
}: TenantListProps) {
  const router = useRouter();

  // Table columns
  const columns: ColumnsType<TenantUI> = [
    {
      title: 'Couple',
      key: 'couple',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.brideName} & {record.groomName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.slug}</div>
        </div>
      ),
    },
    {
      title: 'Wedding Date',
      dataIndex: 'weddingDate',
      key: 'weddingDate',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: true,
    },
    {
      title: 'Venue',
      dataIndex: 'venueName',
      key: 'venueName',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/tenants/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={tenants}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} tenants`,
        onChange: onTableChange,
        onShowSizeChange: onTableChange,
      }}
    />
  );
}
