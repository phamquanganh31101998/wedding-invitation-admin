'use client';

import { Modal, Typography, Button, Space } from 'antd';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import dayjs from 'dayjs';
import { TenantUI } from '@/types/tenant';

const { Title, Text } = Typography;

interface ThemePreviewModalProps {
  tenant: TenantUI;
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
            background: `linear-gradient(135deg, ${tenant.themePrimaryColor}, ${tenant.themeSecondaryColor})`,
            padding: 40,
            borderRadius: 12,
            color: '#fff',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <Title level={2} style={{ color: '#fff', margin: 0, marginBottom: 8 }}>
            {tenant.brideName} & {tenant.groomName}
          </Title>
          <Title level={4} style={{ color: '#fff', margin: 0, opacity: 0.9, fontWeight: 'normal' }}>
            {dayjs(tenant.weddingDate).format('MMMM DD, YYYY')}
          </Title>
          <div style={{ marginTop: 16 }}>
            <Text style={{ color: '#fff', opacity: 0.8 }}>
              {tenant.venueName}
            </Text>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              style={{
                backgroundColor: tenant.themePrimaryColor,
                borderColor: tenant.themePrimaryColor,
                minWidth: 120
              }}
            >
              RSVP Now
            </Button>
            <Button
              size="large"
              style={{
                backgroundColor: tenant.themeSecondaryColor,
                borderColor: tenant.themeSecondaryColor,
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