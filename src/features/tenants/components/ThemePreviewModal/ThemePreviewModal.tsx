'use client';

import { Modal, Typography, Button, Space } from 'antd';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import dayjs from 'dayjs';
import { Tenant } from '@/types/tenant';

const { Title, Text } = Typography;

interface ThemePreviewModalProps {
  tenant: Tenant;
}

const ThemePreviewModal = NiceModal.create(({ tenant }: ThemePreviewModalProps) => {
  const modal = useModal();
  return (
    <Modal
      title="Theme Preview"
      open={modal.visible}
      onCancel={() => modal.hide()}
      footer={null}
      width={600}
    >
      <div style={{ padding: 16 }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${tenant.theme_primary_color}, ${tenant.theme_secondary_color})`,
            padding: 40,
            borderRadius: 12,
            color: '#fff',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <Title level={2} style={{ color: '#fff', margin: 0, marginBottom: 8 }}>
            {tenant.bride_name} & {tenant.groom_name}
          </Title>
          <Title level={4} style={{ color: '#fff', margin: 0, opacity: 0.9, fontWeight: 'normal' }}>
            {dayjs(tenant.wedding_date).format('MMMM DD, YYYY')}
          </Title>
          <div style={{ marginTop: 16 }}>
            <Text style={{ color: '#fff', opacity: 0.8 }}>
              {tenant.venue_name}
            </Text>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              style={{
                backgroundColor: tenant.theme_primary_color,
                borderColor: tenant.theme_primary_color,
                minWidth: 120
              }}
            >
              RSVP Now
            </Button>
            <Button
              size="large"
              style={{
                backgroundColor: tenant.theme_secondary_color,
                borderColor: tenant.theme_secondary_color,
                color: '#000',
                minWidth: 120
              }}
            >
              View Details
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
});

export default ThemePreviewModal