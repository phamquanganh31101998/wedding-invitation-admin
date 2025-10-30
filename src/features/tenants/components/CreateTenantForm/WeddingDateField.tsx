import { DatePicker } from 'antd';
import { Field } from 'formik';

interface WeddingDateFieldProps {
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
}

export default function WeddingDateField({ errors, touched, setFieldValue }: WeddingDateFieldProps) {
  return (
    <div style={{ marginTop: '16px' }}>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
        Wedding Date *
      </label>
      <Field name="wedding_date">
        {() => (
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Select wedding date"
            onChange={(date) => {
              setFieldValue('wedding_date', date ? date.format('YYYY-MM-DD') : '');
            }}
            status={errors.wedding_date && touched.wedding_date ? 'error' : ''}
          />
        )}
      </Field>
      {errors.wedding_date && touched.wedding_date && (
        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
          {errors.wedding_date}
        </div>
      )}
    </div>
  );
}