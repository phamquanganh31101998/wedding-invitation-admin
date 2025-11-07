'use client';

import { Card, Row, Col, Statistic, Skeleton, Alert, Button, Spin } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useGetGuestStats } from '@/features/guests/services';
import { useIsFetching } from '@tanstack/react-query';
import { guestKeys } from '@/features/guests/services/guest.constants';

interface GuestStatisticsProps {
  tenantId: number;
}

export default function GuestStatistics({ tenantId }: GuestStatisticsProps) {
  const { stats, isLoading, error, refetch } = useGetGuestStats(tenantId);

  // Check if stats are being refetched (for loading indicator overlay)
  const isFetchingStats = useIsFetching({ queryKey: guestKeys.stats(tenantId) }) > 0;

  // Handle loading state with skeleton
  if (isLoading) {
    return (
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={12} md={6}>
            <div style={{ padding: '8px 0' }}>
              <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 8 }} />
              <Skeleton.Input active size="large" style={{ width: 80 }} />
            </div>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <div style={{ padding: '8px 0' }}>
              <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 8 }} />
              <Skeleton.Input active size="large" style={{ width: 80 }} />
            </div>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <div style={{ padding: '8px 0' }}>
              <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 8 }} />
              <Skeleton.Input active size="large" style={{ width: 80 }} />
            </div>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <div style={{ padding: '8px 0' }}>
              <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 8 }} />
              <Skeleton.Input active size="large" style={{ width: 80 }} />
            </div>
          </Col>
        </Row>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card>
        <Alert
          message="Error Loading Statistics"
          description="Failed to load guest statistics. Please try again."
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  // Handle no data state
  if (!stats) {
    return (
      <Card>
        <Alert
          message="No Statistics Available"
          description="Guest statistics will appear here once guests are added."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card>
      <Spin spinning={isFetchingStats && !isLoading} tip="Updating statistics...">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={12} md={6}>
            <Statistic
              title="Total Guests"
              value={stats.total}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ fontSize: 24 }}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Statistic
              title="Attending"
              value={stats.attending}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Statistic
              title="Not Attending"
              value={stats.notAttending}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Statistic
              title="Maybe"
              value={stats.maybe}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
            />
          </Col>
        </Row>
      </Spin>
    </Card>
  );
}
