'use client';

import { Breadcrumb } from 'antd';
import { usePathname } from 'next/navigation';
import {
  HomeOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { BreadcrumbProps } from 'antd';

interface DashboardBreadcrumbProps {
  customItems?: BreadcrumbProps['items'];
}

export default function DashboardBreadcrumb({ customItems }: DashboardBreadcrumbProps) {
  const pathname = usePathname();

  // Generate breadcrumb items based on current path
  const generateBreadcrumbItems = (): BreadcrumbProps['items'] => {
    const items: BreadcrumbProps['items'] = [
      {
        href: '/dashboard',
        title: <HomeOutlined />,
      },
    ];

    if (pathname.startsWith('/tenants')) {
      items.push({
        href: '/tenants',
        title: (
          <span>
            <TeamOutlined />
            <span>Tenant Management</span>
          </span>
        ),
      });

      // If we're on a specific tenant page
      if (pathname.match(/\/tenants\/\d+/)) {
        // This will be overridden by customItems if provided
        items.push({
          title: 'Tenant Details',
        });
      }
    } else if (pathname.startsWith('/dashboard/rsvp')) {
      items.push({
        href: '/dashboard/rsvp',
        title: (
          <span>
            <BarChartOutlined />
            <span>RSVP Tracking</span>
          </span>
        ),
      });
    } else if (pathname.startsWith('/dashboard/settings')) {
      items.push({
        href: '/dashboard/settings',
        title: (
          <span>
            <SettingOutlined />
            <span>Settings</span>
          </span>
        ),
      });
    }

    return items;
  };

  const items = customItems || generateBreadcrumbItems();

  return (
    <Breadcrumb
      style={{ marginBottom: 16 }}
      items={items}
    />
  );
}