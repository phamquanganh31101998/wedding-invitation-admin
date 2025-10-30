import { Input } from 'antd';
import { Field } from 'formik';

interface ThemeColorFieldsProps {
  errors: any;
  touched: any;
}

export default function ThemeColorFields({ errors, touched }: ThemeColorFieldsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Primary Color
        </label>
        <Field name="theme_primary_color">
          {({ field }: any) => (
            <Input
              {...field}
              type="color"
              style={{ height: '40px' }}
              status={errors.theme_primary_color && touched.theme_primary_color ? 'error' : ''}
            />
          )}
        </Field>
        {errors.theme_primary_color && touched.theme_primary_color && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
            {errors.theme_primary_color}
          </div>
        )}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Secondary Color
        </label>
        <Field name="theme_secondary_color">
          {({ field }: any) => (
            <Input
              {...field}
              type="color"
              style={{ height: '40px' }}
              status={errors.theme_secondary_color && touched.theme_secondary_color ? 'error' : ''}
            />
          )}
        </Field>
        {errors.theme_secondary_color && touched.theme_secondary_color && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
            {errors.theme_secondary_color}
          </div>
        )}
      </div>
    </div>
  );
}