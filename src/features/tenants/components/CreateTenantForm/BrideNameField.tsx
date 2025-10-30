import { Input } from 'antd';
import { Field } from 'formik';

interface BrideNameFieldProps {
  errors: any;
  touched: any;
  onNameChange: (name: string) => void;
}

export default function BrideNameField({ errors, touched, onNameChange }: BrideNameFieldProps) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
        Bride Name *
      </label>
      <Field name="bride_name">
        {({ field }: any) => (
          <Input
            {...field}
            placeholder="Enter bride's name"
            status={errors.bride_name && touched.bride_name ? 'error' : ''}
            onChange={(e) => {
              field.onChange(e);
              onNameChange(e.target.value);
            }}
          />
        )}
      </Field>
      {errors.bride_name && touched.bride_name && (
        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
          {errors.bride_name}
        </div>
      )}
    </div>
  );
}