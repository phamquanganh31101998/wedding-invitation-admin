'use client';

import { Typography, Button } from 'antd';
import dayjs from 'dayjs';
import { Tenant } from '@/types/tenant';

const { Title, Text } = Typography;

interface ThemePreviewProps {
  tenant: Tenant;
}

export default function ThemePreview({ tenant }: ThemePreviewProps) {
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${tenant.theme_primary_color}, ${tenant.theme_secondary_color})`,
          padding: 24,
          borderRadius: 8,
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          {tenant.bride_name} & {tenant.groom_name}
        </Title>
        <Text style={{ color: '#fff', opacity: 0.9 }}>
          {dayjs(tenant.wedding_date).format('MMMM DD, YYYY')}
        </Text>
      </div>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button
          type="primary"
          style={{ backgroundColor: tenant.theme_primary_color, borderColor: tenant.theme_primary_color }}
        >
          Primary Button
        </Button>
        <Button
          style={{
            marginLeft: 8,
            backgroundColor: tenant.theme_secondary_color,
            borderColor: tenant.theme_secondary_color,
            color: '#000'
          }}
        >
          Secondary Button
        </Button>
      </div>
    </div>
  );
}