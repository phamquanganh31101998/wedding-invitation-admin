'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Button,
  Space,
  Avatar,
  Dropdown,
} from 'antd';
import {
  LogoutOutlined,
  TeamOutlined,
  SettingOutlined,
  BarChartOutlined,
  DashboardOutlined,
  UserOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

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

  // Navigation menu items
  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/dashboard'),
    },
    {
      key: '/tenants',
      icon: <TeamOutlined />,
      label: 'Tenant Management',
      onClick: () => router.push('/tenants'),
    },
    {
      key: '/ai-chat',
      icon: <MessageOutlined />,
      label: 'AI Assistant',
      onClick: () => router.push('/ai-chat'),
    },
    {
      key: 'rsvp',
      icon: <BarChartOutlined />,
      label: 'RSVP Tracking',
      disabled: true,
      title: 'Coming Soon',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      disabled: true,
      title: 'Coming Soon',
    },
  ];

  // User dropdown menu
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  // Get selected menu key based on current path
  const getSelectedKey = () => {
    if (pathname === '/dashboard') return '/dashboard';
    if (pathname.startsWith('/tenants')) return '/tenants';
    if (pathname.startsWith('/ai-chat')) return '/ai-chat';
    return pathname;
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
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            Wedding Admin Panel
          </Title>
        </div>

        <Space>
          <span>Welcome, {session.user?.name}</span>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button
              type="text"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Avatar size="small" icon={<UserOutlined />} />
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        <Sider
          width={250}
          breakpoint="lg"
          collapsedWidth="0"
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            style={{
              height: '100%',
              borderRight: 0,
              paddingTop: 16,
            }}
            items={menuItems}
          />
        </Sider>

        <Layout style={{ background: '#f0f2f5' }}>
          <Content style={{ margin: 0, minHeight: 280 }}>{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
