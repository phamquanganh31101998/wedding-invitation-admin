import { Input } from 'antd';
import { Field } from 'formik';

interface ThemeColorFieldsProps {
  errors: any;
  touched: any;
}

export default function ThemeColorFields({
  errors,
  touched,
}: ThemeColorFieldsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginTop: '16px',
      }}
    >
      <div>
        <label
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          Primary Color
        </label>
        <Field name="themePrimaryColor">
          {({ field }: any) => (
            <Input
              {...field}
              type="color"
              style={{ height: '40px' }}
              status={
                errors.themePrimaryColor && touched.themePrimaryColor
                  ? 'error'
                  : ''
              }
            />
          )}
        </Field>
        {errors.themePrimaryColor && touched.themePrimaryColor && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
            {errors.themePrimaryColor}
          </div>
        )}
      </div>

      <div>
        <label
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          Secondary Color
        </label>
        <Field name="themeSecondaryColor">
          {({ field }: any) => (
            <Input
              {...field}
              type="color"
              style={{ height: '40px' }}
              status={
                errors.themeSecondaryColor && touched.themeSecondaryColor
                  ? 'error'
                  : ''
              }
            />
          )}
        </Field>
        {errors.themeSecondaryColor && touched.themeSecondaryColor && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
            {errors.themeSecondaryColor}
          </div>
        )}
      </div>
    </div>
  );
}
