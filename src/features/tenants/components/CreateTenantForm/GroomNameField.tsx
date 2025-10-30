import { Input } from 'antd';
import { Field } from 'formik';

interface GroomNameFieldProps {
  errors: any;
  touched: any;
  onNameChange: (name: string) => void;
}

export default function GroomNameField({ errors, touched, onNameChange }: GroomNameFieldProps) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
        Groom Name *
      </label>
      <Field name="groom_name">
        {({ field }: any) => (
          <Input
            {...field}
            placeholder="Enter groom's name"
            status={errors.groom_name && touched.groom_name ? 'error' : ''}
            onChange={(e) => {
              field.onChange(e);
              onNameChange(e.target.value);
            }}
          />
        )}
      </Field>
      {errors.groom_name && touched.groom_name && (
        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
          {errors.groom_name}
        </div>
      )}
    </div>
  );
}