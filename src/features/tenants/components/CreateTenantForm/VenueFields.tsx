import { Input } from 'antd';
import { Field } from 'formik';

interface VenueFieldsProps {
  errors: any;
  touched: any;
}

export default function VenueFields({ errors, touched }: VenueFieldsProps) {
  return (
    <>
      {/* Venue Information */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Venue Name *
          </label>
          <Field name="venue_name">
            {({ field }: any) => (
              <Input
                {...field}
                placeholder="Enter venue name"
                status={errors.venue_name && touched.venue_name ? 'error' : ''}
              />
            )}
          </Field>
          {errors.venue_name && touched.venue_name && (
            <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
              {errors.venue_name}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Venue Map Link
          </label>
          <Field name="venue_map_link">
            {({ field }: any) => (
              <Input
                {...field}
                placeholder="https://maps.google.com/..."
                status={errors.venue_map_link && touched.venue_map_link ? 'error' : ''}
              />
            )}
          </Field>
          {errors.venue_map_link && touched.venue_map_link && (
            <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
              {errors.venue_map_link}
            </div>
          )}
        </div>
      </div>

      {/* Venue Address */}
      <div style={{ marginTop: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Venue Address *
        </label>
        <Field name="venue_address">
          {({ field }: any) => (
            <Input.TextArea
              {...field}
              placeholder="Enter complete venue address"
              rows={2}
              status={errors.venue_address && touched.venue_address ? 'error' : ''}
            />
          )}
        </Field>
        {errors.venue_address && touched.venue_address && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
            {errors.venue_address}
          </div>
        )}
      </div>
    </>
  );
}