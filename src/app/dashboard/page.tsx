'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Layout, Typography, Button, Card, Space } from 'antd';
import { LogoutOutlined, HeartOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          <HeartOutlined style={{ marginRight: 8 }} />
          Wedding Admin Panel
        </Title>
        <Space>
          <span>Welcome, {session.user?.name}</span>
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <HeartOutlined
                style={{ fontSize: 64, color: '#ff69b4', marginBottom: 24 }}
              />
              <Title level={1}>Welcome to Wedding Admin Panel!</Title>
              <Paragraph
                style={{
                  fontSize: 18,
                  color: '#666',
                  maxWidth: 600,
                  margin: '0 auto',
                }}
              >
                This is your wedding invitation administrator dashboard. Here
                you&apos;ll be able to manage invitations, track RSVPs, and
                handle all your wedding planning needs.
              </Paragraph>
              <Paragraph style={{ marginTop: 24, color: '#999' }}>
                Features coming soon: Guest management, Invitation templates,
                RSVP tracking, and more!
              </Paragraph>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
