'use client';

import { Modal } from 'antd';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { CreateTenantForm } from '../CreateTenantForm';

interface CreateTenantModalProps {
  onSuccess?: () => void;
}

export default NiceModal.create(({ onSuccess }: CreateTenantModalProps) => {
  const modal = useModal();

  const handleSuccess = () => {
    modal.hide();
    onSuccess?.();
  };

  const handleCancel = () => {
    modal.hide();
  };

  return (
    <Modal
      title="Create New Tenant"
      open={modal.visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      <CreateTenantForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </Modal>
  );
});