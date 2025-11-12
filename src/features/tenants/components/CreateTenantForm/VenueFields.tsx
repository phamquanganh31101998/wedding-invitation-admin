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
            style={{
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold',
            }}
          >
            Venue Name *
          </label>
          <Field name="venueName">
            {({ field }: any) => (
              <Input
                {...field}
                placeholder="Enter venue name"
                status={errors.venueName && touched.venueName ? 'error' : ''}
              />
            )}
          </Field>
          {errors.venueName && touched.venueName && (
            <div
              style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}
            >
              {errors.venueName}
            </div>
          )}
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold',
            }}
          >
            Venue Map Link
          </label>
          <Field name="venueMapLink">
            {({ field }: any) => (
              <Input
                {...field}
                placeholder="https://maps.google.com/..."
                status={
                  errors.venueMapLink && touched.venueMapLink ? 'error' : ''
                }
              />
            )}
          </Field>
          {errors.venueMapLink && touched.venueMapLink && (
            <div
              style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}
            >
              {errors.venueMapLink}
            </div>
          )}
        </div>
      </div>

      {/* Venue Address */}
      <div style={{ marginTop: '16px' }}>
        <label
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          Venue Address *
        </label>
        <Field name="venueAddress">
          {({ field }: any) => (
            <Input.TextArea
              {...field}
              placeholder="Enter complete venue address"
              rows={2}
              status={
                errors.venueAddress && touched.venueAddress ? 'error' : ''
              }
            />
          )}
        </Field>
        {errors.venueAddress && touched.venueAddress && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
            {errors.venueAddress}
          </div>
        )}
      </div>
    </>
  );
}
