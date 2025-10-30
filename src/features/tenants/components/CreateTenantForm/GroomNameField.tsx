import { Input } from 'antd';
import { Field } from 'formik';

interface GroomNameFieldProps {
  errors: any;
  touched: any;
}

export default function GroomNameField({ errors, touched }: GroomNameFieldProps) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
        Groom Name *
      </label>
      <Field name="groomName">
        {({ field }: any) => (
          <Input
            {...field}
            placeholder="Enter groom's name"
            status={errors.groomName && touched.groomName ? 'error' : ''}
          />
        )}
      </Field>
      {errors.groomName && touched.groomName && (
        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
          {errors.groomName}
        </div>
      )}
    </div>
  );
}