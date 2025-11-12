import { Button, Space, message } from 'antd';
import { Formik, Form } from 'formik';
import { TenantCreateRequestUI } from '@/types/tenant';
import { tenantValidationSchema } from './validation';
import BrideNameField from './BrideNameField';
import GroomNameField from './GroomNameField';
import SlugField from './SlugField';
import WeddingDateField from './WeddingDateField';
import VenueFields from './VenueFields';
import ContactFields from './ContactFields';
import ThemeColorFields from './ThemeColorFields';

interface CreateTenantFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateTenantForm({
  onSuccess,
  onCancel,
}: CreateTenantFormProps) {
  // Create tenant
  const createTenant = async (values: TenantCreateRequestUI) => {
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success('Tenant created successfully');
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
        brideName: '',
        groomName: '',
        slug: '',
        weddingDate: '',
        venueName: '',
        venueAddress: '',
        venueMapLink: '',
        email: '',
        phone: '',
        themePrimaryColor: '#E53E3E',
        themeSecondaryColor: '#FED7D7',
      }}
      validationSchema={tenantValidationSchema}
      onSubmit={createTenant}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => (
        <Form>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <BrideNameField errors={errors} touched={touched} />
            <GroomNameField errors={errors} touched={touched} />
          </div>

          <SlugField
            errors={errors}
            touched={touched}
            brideName={values.brideName}
            groomName={values.groomName}
          />

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
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Create Tenant
              </Button>
            </Space>
          </div>
        </Form>
      )}
    </Formik>
  );
}
