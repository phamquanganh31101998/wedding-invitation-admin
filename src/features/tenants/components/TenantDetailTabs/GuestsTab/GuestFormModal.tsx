'use client';

import { Modal, Input, Select, Button, Space } from 'antd';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { IGuest, IGuestCreateRequest } from '@/features/guests/services/guest.types';
import { GUEST_ATTENDANCE_OPTIONS } from '@/features/guests/services/guest.constants';
import { useCreateGuest, useUpdateGuest } from '@/features/guests/services/guest.hooks';

const { TextArea } = Input;

interface GuestFormModalProps {
  tenantId: number;
  guest?: IGuest;
  onSuccess?: () => void;
}

// Validation schema
const guestValidationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(1, 'Name must be at least 1 character')
    .max(100, 'Name must not exceed 100 characters'),
  relationship: Yup.string()
    .required('Relationship is required')
    .min(1, 'Relationship must be at least 1 character')
    .max(50, 'Relationship must not exceed 50 characters'),
  attendance: Yup.string()
    .required('Attendance is required')
    .oneOf(['yes', 'no', 'maybe'], 'Invalid attendance value'),
  message: Yup.string().max(1000, 'Message must not exceed 1000 characters'),
});

export default NiceModal.create(({ tenantId, guest, onSuccess }: GuestFormModalProps) => {
  const modal = useModal();
  const { createGuest, isCreating } = useCreateGuest(tenantId);
  const { updateGuest, isUpdating } = useUpdateGuest(tenantId);

  const isEditMode = !!guest;
  const isSubmitting = isCreating || isUpdating;

  const handleSubmit = async (values: IGuestCreateRequest) => {
    try {
      if (isEditMode && guest) {
        await updateGuest({ guestId: guest.id, data: values });
      } else {
        await createGuest(values);
      }
      modal.hide();
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the hooks
      console.error('Error submitting guest form:', error);
    }
  };

  const handleCancel = () => {
    modal.hide();
  };

  return (
    <Modal
      title={isEditMode ? 'Edit Guest' : 'Add New Guest'}
      open={modal.visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Formik
        initialValues={{
          name: guest?.name || '',
          relationship: guest?.relationship || '',
          attendance: guest?.attendance || 'maybe',
          message: guest?.message || '',
        }}
        validationSchema={guestValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            {/* Name Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                Name <span style={{ color: '#ff4d4f' }}>*</span>
              </label>
              <Field name="name">
                {({ field }: any) => (
                  <Input
                    {...field}
                    placeholder="Enter guest name"
                    status={errors.name && touched.name ? 'error' : ''}
                    size="large"
                  />
                )}
              </Field>
              {errors.name && touched.name && (
                <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '6px' }}>
                  {errors.name}
                </div>
              )}
            </div>

            {/* Relationship Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                Relationship <span style={{ color: '#ff4d4f' }}>*</span>
              </label>
              <Field name="relationship">
                {({ field }: any) => (
                  <Input
                    {...field}
                    placeholder="e.g., Friend, Family, Colleague"
                    status={errors.relationship && touched.relationship ? 'error' : ''}
                    size="large"
                  />
                )}
              </Field>
              {errors.relationship && touched.relationship && (
                <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '6px' }}>
                  {errors.relationship}
                </div>
              )}
              <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '6px' }}>
                How this guest relates to the wedding couple
              </div>
            </div>

            {/* Attendance Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                Attendance <span style={{ color: '#ff4d4f' }}>*</span>
              </label>
              <Select
                value={values.attendance}
                onChange={(value) => setFieldValue('attendance', value)}
                options={GUEST_ATTENDANCE_OPTIONS}
                style={{ width: '100%' }}
                status={errors.attendance && touched.attendance ? 'error' : ''}
                size="large"
              />
              {errors.attendance && touched.attendance && (
                <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '6px' }}>
                  {errors.attendance}
                </div>
              )}
            </div>

            {/* Message Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                Message <span style={{ color: '#8c8c8c', fontWeight: 400 }}>(Optional)</span>
              </label>
              <Field name="message">
                {({ field }: any) => (
                  <TextArea
                    {...field}
                    placeholder="Optional message from guest"
                    rows={4}
                    status={errors.message && touched.message ? 'error' : ''}
                    showCount
                    maxLength={1000}
                  />
                )}
              </Field>
              {errors.message && touched.message && (
                <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '6px' }}>
                  {errors.message}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <Space>
                <Button onClick={handleCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                >
                  {isEditMode ? 'Update Guest' : 'Add Guest'}
                </Button>
              </Space>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
});
