import * as Yup from 'yup';

export const tenantValidationSchema = Yup.object({
  bride_name: Yup.string()
    .required('Bride name is required')
    .min(2, 'Bride name must be at least 2 characters')
    .max(100, 'Bride name must not exceed 100 characters')
    .matches(
      /^[a-zA-Z\s\-']+$/,
      'Only letters, spaces, hyphens, and apostrophes allowed'
    ),
  groom_name: Yup.string()
    .required('Groom name is required')
    .min(2, 'Groom name must be at least 2 characters')
    .max(100, 'Groom name must not exceed 100 characters')
    .matches(
      /^[a-zA-Z\s\-']+$/,
      'Only letters, spaces, hyphens, and apostrophes allowed'
    ),
  wedding_date: Yup.date()
    .required('Wedding date is required')
    .min(new Date('1900-01-01'), 'Wedding date must be after 1900'),
  venue_name: Yup.string()
    .required('Venue name is required')
    .min(2, 'Venue name must be at least 2 characters')
    .max(200, 'Venue name must not exceed 200 characters'),
  venue_address: Yup.string()
    .required('Venue address is required')
    .min(5, 'Venue address must be at least 5 characters'),
  venue_map_link: Yup.string().url('Must be a valid URL').nullable(),
  email: Yup.string().email('Must be a valid email address').nullable(),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Must be a valid phone number')
    .nullable(),
  theme_primary_color: Yup.string()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color')
    .nullable(),
  theme_secondary_color: Yup.string()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color')
    .nullable(),
});
