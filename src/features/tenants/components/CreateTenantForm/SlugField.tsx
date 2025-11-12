import { useState } from 'react';
import { Button, Input, Space, message } from 'antd';
import { Field, FieldProps } from 'formik';
import { ReloadOutlined } from '@ant-design/icons';

interface SlugFieldProps {
  errors: any;
  touched: any;
  brideName: string;
  groomName: string;
}

export default function SlugField({
  errors,
  touched,
  brideName,
  groomName,
}: SlugFieldProps) {
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  // Generate slug from bride and groom names
  const generateSlug = async (setFieldValue: any) => {
    if (!brideName || !groomName) {
      return;
    }

    setIsGeneratingSlug(true);
    try {
      const response = await fetch('/api/tenants/generate-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brideName, groomName }),
      });

      const result = await response.json();
      if (result.success) {
        setFieldValue('slug', result.data.slug);
      }
    } catch (error) {
      console.error('Failed to generate slug:', error);
      message.error('Failed to generate slug');
    } finally {
      setIsGeneratingSlug(false);
    }
  };
  const hasError = errors.slug && touched.slug;
  const canGenerate = brideName.trim() && groomName.trim();

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
        Slug *
      </label>
      <Field name="slug">
        {({ field, form }: FieldProps) => (
          <Space.Compact style={{ width: '100%' }}>
            <Input
              {...field}
              placeholder="Enter slug or generate from names"
              status={hasError ? 'error' : undefined}
              style={{ flex: 1 }}
              onChange={(e) => {
                // Normalize input to follow slug rules
                const value = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-');
                form.setFieldValue('slug', value);
              }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => generateSlug(form.setFieldValue)}
              disabled={!canGenerate}
              loading={isGeneratingSlug}
              title={
                canGenerate
                  ? 'Generate slug from bride and groom names'
                  : 'Enter bride and groom names first'
              }
            >
              Generate
            </Button>
          </Space.Compact>
        )}
      </Field>
      {hasError && (
        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
          {errors.slug}
        </div>
      )}
      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
        URL-friendly identifier (lowercase letters, numbers, hyphens only)
      </div>
    </div>
  );
}
