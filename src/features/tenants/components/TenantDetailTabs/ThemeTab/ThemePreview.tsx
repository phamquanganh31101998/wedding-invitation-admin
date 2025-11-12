'use client';

import { Typography, Button } from 'antd';
import dayjs from 'dayjs';
import { TenantUI } from '@/types/tenant';

const { Title, Text } = Typography;

interface ThemePreviewProps {
  tenant: TenantUI;
}

export default function ThemePreview({ tenant }: ThemePreviewProps) {
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${tenant.themePrimaryColor}, ${tenant.themeSecondaryColor})`,
          padding: 24,
          borderRadius: 8,
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          {tenant.brideName} & {tenant.groomName}
        </Title>
        <Text style={{ color: '#fff', opacity: 0.9 }}>
          {dayjs(tenant.weddingDate).format('MMMM DD, YYYY')}
        </Text>
      </div>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button
          type="primary"
          style={{
            backgroundColor: tenant.themePrimaryColor,
            borderColor: tenant.themePrimaryColor,
          }}
        >
          Primary Button
        </Button>
        <Button
          style={{
            marginLeft: 8,
            backgroundColor: tenant.themeSecondaryColor,
            borderColor: tenant.themeSecondaryColor,
            color: '#000',
          }}
        >
          Secondary Button
        </Button>
      </div>
    </div>
  );
}
