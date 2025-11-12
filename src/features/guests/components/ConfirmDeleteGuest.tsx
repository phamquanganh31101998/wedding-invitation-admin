'use client';

import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { IGuest } from '@/features/guests/services';

interface ConfirmDeleteGuestProps {
  guest: IGuest;
  onConfirm: () => Promise<void>;
}

const ConfirmDeleteGuest = NiceModal.create<ConfirmDeleteGuestProps>(
  ({ guest, onConfirm }) => {
    const modal = useModal();

    const handleOk = async () => {
      try {
        await onConfirm();
        modal.resolve();
        modal.hide();
      } catch (error) {
        // Error is handled by the parent component
        console.error('Delete failed:', error);
      }
    };

    const handleCancel = () => {
      modal.reject();
      modal.hide();
    };

    return (
      <Modal
        title="Delete Guest"
        open={modal.visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        confirmLoading={false}
        afterClose={modal.remove}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <ExclamationCircleOutlined
            style={{ color: '#faad14', fontSize: 22, marginTop: 2 }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, marginBottom: 12 }}>
              Are you sure you want to delete this guest?
            </p>
            <p style={{ margin: 0, marginBottom: 4 }}>
              <strong>Name:</strong> {guest.name}
            </p>
            <p style={{ margin: 0, marginBottom: 12 }}>
              <strong>Relationship:</strong> {guest.relationship}
            </p>
            <p style={{ color: '#ff4d4f', margin: 0 }}>
              This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    );
  }
);

export default ConfirmDeleteGuest;
