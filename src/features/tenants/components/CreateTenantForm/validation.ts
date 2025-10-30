import * as Yup from 'yup';

export const tenantValidationSchema = Yup.object({
  brideName: Yup.string()
    .required('Bride name is required')
    .min(2, 'Bride name must be at least 2 characters')
    .max(100, 'Bride name must not exceed 100 characters')
    .matches(
      /^[a-zA-Z\s\-']+$/,
      'Only letters, spaces, hyphens, and apostrophes allowed'
    ),
  groomName: Yup.string()
    .required('Groom name is required')
    .min(2, 'Groom name must be at least 2 characters')
    .max(100, 'Groom name must not exceed 100 characters')
    .matches(
      /^[a-zA-Z\s\-']+$/,
      'Only letters, spaces, hyphens, and apostrophes allowed'
    ),
  weddingDate: Yup.date()
    .required('Wedding date is required')
    .min(new Date('1900-01-01'), 'Wedding date must be after 1900'),
  venueName: Yup.string()
    .required('Venue name is required')
    .min(2, 'Venue name must be at least 2 characters')
    .max(200, 'Venue name must not exceed 200 characters'),
  venueAddress: Yup.string()
    .required('Venue address is required')
    .min(5, 'Venue address must be at least 5 characters'),
  venueMapLink: Yup.string().url('Must be a valid URL').nullable(),
  email: Yup.string().email('Must be a valid email address').nullable(),
  phone: Yup.string()
    .matches(/^(\+\d{1,3})?[0-9]{8,15}$/, 'Must be a valid phone number')
    .nullable(),
  themePrimaryColor: Yup.string()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color')
    .nullable(),
  themeSecondaryColor: Yup.string()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color')
    .nullable(),
});
