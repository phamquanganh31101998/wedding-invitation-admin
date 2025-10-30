import { Input } from 'antd';
import { Field } from 'formik';

interface ContactFieldsProps {
  errors: any;
  touched: any;
}

export default function ContactFields({ errors, touched }: ContactFieldsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Email
        </label>
        <Field name="email">
          {({ field }: any) => (
            <Input
              {...field}
              placeholder="contact@example.com"
              status={errors.email && touched.email ? 'error' : ''}
            />
          )}
        </Field>
        {errors.email && touched.email && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
            {errors.email}
          </div>
        )}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Phone
        </label>
        <Field name="phone">
          {({ field }: any) => (
            <Input
              {...field}
              placeholder="+1234567890"
              status={errors.phone && touched.phone ? 'error' : ''}
            />
          )}
        </Field>
        {errors.phone && touched.phone && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
            {errors.phone}
          </div>
        )}
      </div>
    </div>
  );
}