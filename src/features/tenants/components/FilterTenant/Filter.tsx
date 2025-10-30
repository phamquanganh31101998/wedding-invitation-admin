import { Button, Input, Select, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

interface FilterProps {
  onSearch: (value: string) => void;
  onStatusFilterChange: (value: boolean | undefined) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function Filter({ onSearch, onStatusFilterChange, onRefresh, loading }: FilterProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Space wrap>
        <Search
          placeholder="Search by names or slug..."
          allowClear
          style={{ width: 300 }}
          onSearch={onSearch}
          enterButton={<SearchOutlined />}
        />
        <Select
          placeholder="Filter by status"
          style={{ width: 150 }}
          allowClear
          onChange={onStatusFilterChange}
        >
          <Option value={true}>Active</Option>
          <Option value={false}>Inactive</Option>
        </Select>
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </Space>
    </div>
  );
}