import { useState } from 'react';
import { Button, Space, message } from 'antd';
import { Formik, Form } from 'formik';
import { TenantCreateRequest } from '@/types/tenant';
import { tenantValidationSchema } from './validation';
import BrideNameField from './BrideNameField';
import GroomNameField from './GroomNameField';
import WeddingDateField from './WeddingDateField';
import VenueFields from './VenueFields';
import ContactFields from './ContactFields';
import ThemeColorFields from './ThemeColorFields';

interface CreateTenantFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateTenantForm({ onSuccess, onCancel }: CreateTenantFormProps) {
  const [generatedSlug, setGeneratedSlug] = useState('');

  // Generate slug from bride and groom names
  const generateSlug = async (brideName: string, groomName: string) => {
    if (!brideName || !groomName) {
      setGeneratedSlug('');
      return;
    }

    try {
      const response = await fetch('/api/tenants/generate-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bride_name: brideName, groom_name: groomName }),
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedSlug(result.data.slug);
      }
    } catch (error) {
      console.error('Failed to generate slug:', error);
    }
  };

  // Create tenant
  const createTenant = async (values: TenantCreateRequest) => {
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success('Tenant created successfully');
        setGeneratedSlug('');
        onSuccess();
      } else {
        message.error(result.error?.message || 'Failed to create tenant');
      }
    } catch (error) {
      message.error('Failed to create tenant');
    }
  };

  return (
    <Formik
      initialValues={{
        bride_name: '',
        groom_name: '',
        wedding_date: '',
        venue_name: '',
        venue_address: '',
        venue_map_link: '',
        email: '',
        phone: '',
        theme_primary_color: '#E53E3E',
        theme_secondary_color: '#FED7D7',
      }}
      validationSchema={tenantValidationSchema}
      onSubmit={createTenant}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => (
        <Form>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <BrideNameField
              errors={errors}
              touched={touched}
              onNameChange={(name) => generateSlug(name, values.groom_name)}
            />
            <GroomNameField
              errors={errors}
              touched={touched}
              onNameChange={(name) => generateSlug(values.bride_name, name)}
            />
          </div>

          {/* Generated Slug Preview */}
          {generatedSlug && (
            <div style={{ margin: '16px 0', padding: '8px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
              <strong>Generated URL:</strong> {generatedSlug}
            </div>
          )}

          <WeddingDateField
            errors={errors}
            touched={touched}
            setFieldValue={setFieldValue}
          />

          <VenueFields errors={errors} touched={touched} />

          <ContactFields errors={errors} touched={touched} />

          <ThemeColorFields errors={errors} touched={touched} />

          {/* Form Actions */}
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
              >
                Create Tenant
              </Button>
            </Space>
          </div>
        </Form>
      )}
    </Formik>
  );
}