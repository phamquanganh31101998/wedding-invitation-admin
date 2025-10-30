import { Input } from 'antd';
import { Field } from 'formik';

interface BrideNameFieldProps {
  errors: any;
  touched: any;
}

export default function BrideNameField({ errors, touched }: BrideNameFieldProps) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
        Bride Name *
      </label>
      <Field name="brideName">
        {({ field }: any) => (
          <Input
            {...field}
            placeholder="Enter bride's name"
            status={errors.brideName && touched.brideName ? 'error' : ''}
          />
        )}
      </Field>
      {errors.brideName && touched.brideName && (
        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
          {errors.brideName}
        </div>
      )}
    </div>
  );
}