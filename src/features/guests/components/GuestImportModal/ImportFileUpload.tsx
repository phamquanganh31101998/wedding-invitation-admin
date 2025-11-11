'use client';

import { Upload, Button, Alert, Flex } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  IMPORT_FILE_MAX_SIZE,
  IMPORT_ACCEPTED_FORMATS,
} from '@/features/guests/services/guest.constants';

interface ImportFileUploadProps {
  fileList: UploadFile[];
  isProcessing: boolean;
  onFileChange: (info: any) => void;
}

export default function ImportFileUpload({
  fileList,
  isProcessing,
  onFileChange,
}: ImportFileUploadProps) {
  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/api/tenants/import-sample';
    link.download = 'import-sample.csv';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Alert
        message="File Requirements"
        description={
          <div style={{ lineHeight: 1.8 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Accepted formats:</strong>{' '}
              {IMPORT_ACCEPTED_FORMATS.join(', ')}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Maximum file size:</strong>{' '}
              {IMPORT_FILE_MAX_SIZE / 1024 / 1024}MB
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Required columns:</strong> name, relationship, attendance
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Optional columns:</strong> message
            </div>
            <div>
              <strong>Valid attendance values:</strong> yes, no, maybe
            </div>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 20 }}
      />

      <Flex align="start" gap={8}>
        <Upload
          fileList={fileList}
          onChange={onFileChange}
          beforeUpload={() => false}
          accept={IMPORT_ACCEPTED_FORMATS.join(',')}
          maxCount={1}
        >
          <Button
            icon={<UploadOutlined />}
            loading={isProcessing}
            size="large"
          >
            {isProcessing ? 'Processing...' : 'Select File'}
          </Button>
        </Upload>
      </Flex>

      {fileList.length === 0 && (
        <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 8 }}>
          Select a CSV or Excel file to import guests
        </div>
      )}

      <Button
        size="large"
        type="link"
        style={{ padding: 0 }}
        onClick={handleDownloadSample}
      >
        Download sample file
      </Button>
    </>
  );
}
