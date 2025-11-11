'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

interface GuestFilterProps {
  onSearchChange: (value: string) => void;
  onAttendanceChange: (value: 'yes' | 'no' | 'maybe' | undefined) => void;
}

export default function GuestFilter({
  onSearchChange,
  onAttendanceChange,
}: GuestFilterProps) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [attendanceFilter, setAttendanceFilter] = useState<
    'yes' | 'no' | 'maybe' | undefined
  >(undefined);

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleSearchSubmit = useCallback(
    (value: string) => {
      setSearchInput(value);
      onSearchChange(value);
    },
    [onSearchChange]
  );

  const handleAttendanceFilterChange = (
    value: 'yes' | 'no' | 'maybe' | undefined
  ) => {
    setAttendanceFilter(value);
    onAttendanceChange(value);
  };

  return (
    <Space direction="horizontal" style={{ width: '100%' }} wrap size={[8, 8]}>
      <Search
        placeholder="Search by name or relationship"
        allowClear
        value={searchInput}
        onSearch={handleSearchSubmit}
        onChange={(e) => handleSearchInputChange(e.target.value)}
        style={{ minWidth: 200, maxWidth: 300 }}
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
  );
}
