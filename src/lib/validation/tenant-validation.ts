import * as Yup from 'yup';

/**
 * Yup validation schema for tenant creation
 */
export const tenantCreateSchema = Yup.object({
  slug: Yup.string()
    .required('Slug is required')
    .min(3, 'Slug must be at least 3 characters long')
    .max(100, 'Slug must not exceed 100 characters')
    .matches(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    )
    .matches(
      /^[a-z0-9].*[a-z0-9]$|^[a-z0-9]$/,
      'Slug must start and end with a letter or number'
    ),
  bride_name: Yup.string()
    .required('Bride name is required')
    .min(2, 'Bride name must be at least 2 characters long')
    .max(100, 'Bride name must not exceed 100 characters')
    .matches(
      /^[a-zA-ZÀ-ỹĐđ\s\-']+$/,
      'Bride name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  groom_name: Yup.string()
    .required('Groom name is required')
    .min(2, 'Groom name must be at least 2 characters long')
    .max(100, 'Groom name must not exceed 100 characters')
    .matches(
      /^[a-zA-ZÀ-ỹĐđ\s\-']+$/,
      'Groom name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  wedding_date: Yup.date()
    .required('Wedding date is required')
    .min(new Date('1900-01-01'), 'Wedding date must be after 1900'),
  venue_name: Yup.string()
    .required('Venue name is required')
    .min(2, 'Venue name must be at least 2 characters long')
    .max(200, 'Venue name must not exceed 200 characters'),
  venue_address: Yup.string()
    .required('Venue address is required')
    .min(5, 'Venue address must be at least 5 characters long'),
  venue_map_link: Yup.string()
    .url('Venue map link must be a valid URL')
    .nullable()
    .optional(),
  email: Yup.string()
    .email('Email must be a valid email address')
    .nullable()
    .optional(),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Phone number must be a valid format')
    .nullable()
    .optional(),
  theme_primary_color: Yup.string()
    .matches(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'Primary color must be a valid hex color code'
    )
    .nullable()
    .optional(),
  theme_secondary_color: Yup.string()
    .matches(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'Secondary color must be a valid hex color code'
    )
    .nullable()
    .optional(),
});

/**
 * Yup validation schema for tenant updates (all fields optional except those being updated)
 */
export const tenantUpdateSchema = Yup.object({
  slug: Yup.string()
    .min(3, 'Slug must be at least 3 characters long')
    .max(100, 'Slug must not exceed 100 characters')
    .matches(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    )
    .matches(
      /^[a-z0-9].*[a-z0-9]$|^[a-z0-9]$/,
      'Slug must start and end with a letter or number'
    )
    .optional(),
  bride_name: Yup.string()
    .min(2, 'Bride name must be at least 2 characters long')
    .max(100, 'Bride name must not exceed 100 characters')
    .matches(
      /^[a-zA-ZÀ-ỹĐđ\s\-']+$/,
      'Bride name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .optional(),
  groom_name: Yup.string()
    .min(2, 'Groom name must be at least 2 characters long')
    .max(100, 'Groom name must not exceed 100 characters')
    .matches(
      /^[a-zA-ZÀ-ỹĐđ\s\-']+$/,
      'Groom name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .optional(),
  wedding_date: Yup.date()
    .min(new Date('1900-01-01'), 'Wedding date must be after 1900')
    .optional(),
  venue_name: Yup.string()
    .min(2, 'Venue name must be at least 2 characters long')
    .max(200, 'Venue name must not exceed 200 characters')
    .optional(),
  venue_address: Yup.string()
    .min(5, 'Venue address must be at least 5 characters long')
    .optional(),
  venue_map_link: Yup.string()
    .url('Venue map link must be a valid URL')
    .nullable()
    .optional(),
  email: Yup.string()
    .email('Email must be a valid email address')
    .nullable()
    .optional(),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Phone number must be a valid format')
    .nullable()
    .optional(),
  theme_primary_color: Yup.string()
    .matches(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'Primary color must be a valid hex color code'
    )
    .nullable()
    .optional(),
  theme_secondary_color: Yup.string()
    .matches(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'Secondary color must be a valid hex color code'
    )
    .nullable()
    .optional(),
  is_active: Yup.boolean().optional(),
});

/**
 * Validate tenant data using Yup schema
 */
export async function validateTenantData(
  data: any,
  isUpdate: boolean = false
): Promise<{ isValid: boolean; errors: Record<string, string> }> {
  try {
    const schema = isUpdate ? tenantUpdateSchema : tenantCreateSchema;
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error: any) {
    const errors: Record<string, string> = {};
    if (error.inner) {
      error.inner.forEach((err: any) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
    }
    return { isValid: false, errors };
  }
}
