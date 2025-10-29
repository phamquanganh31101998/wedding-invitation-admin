'use client';

import { useRouter } from 'next/navigation';
import { Typography, Card, Row, Col } from 'antd';
import {
  TeamOutlined,
  SettingOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Breadcrumb Navigation */}
        <DashboardBreadcrumb />

        {/* Welcome Section */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Title level={1}>Welcome to Wedding Admin Panel!</Title>
            <Paragraph
              style={{
                fontSize: 18,
                color: '#666',
                maxWidth: 600,
                margin: '0 auto',
              }}
            >
              Manage wedding invitations, track RSVPs, and handle all your wedding planning needs.
            </Paragraph>
          </div>
        </Card>

        {/* Quick Actions */}
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: '200px' }}
              onClick={() => router.push('/dashboard/tenants')}
            >
              <TeamOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <Title level={3}>Tenant Management</Title>
              <Paragraph>
                Create and manage wedding tenant spaces for couples
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: '200px', opacity: 0.6 }}
            >
              <BarChartOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
              <Title level={3}>RSVP Tracking</Title>
              <Paragraph>
                Monitor and manage wedding RSVPs
              </Paragraph>
              <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <span style={{ fontSize: '12px', color: '#999' }}>Coming Soon</span>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: '200px', opacity: 0.6 }}
            >
              <SettingOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 16 }} />
              <Title level={3}>Settings</Title>
              <Paragraph>
                Configure system settings and preferences
              </Paragraph>
              <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <span style={{ fontSize: '12px', color: '#999' }}>Coming Soon</span>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
