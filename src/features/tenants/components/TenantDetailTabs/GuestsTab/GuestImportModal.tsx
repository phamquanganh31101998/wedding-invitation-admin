'use client';

import { useState } from 'react';
import {
  Modal,
  Upload,
  Button,
  Space,
  Alert,
  Table,
  Typography,
  Divider,
  Row,
  Col,
  Card,
} from 'antd';
import {
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import type { UploadFile } from 'antd/es/upload/interface';
import { parseGuestFile } from '@/features/guests/services/guest-import.service';
import { useImportGuests } from '@/features/guests/services/guest.hooks';
import {
  IMPORT_FILE_MAX_SIZE,
  IMPORT_ACCEPTED_FORMATS,
} from '@/features/guests/services/guest.constants';
import { IGuestImportRow } from '@/features/guests/services/guest.types';

const { Text, Title } = Typography;

interface GuestImportModalProps {
  tenantId: number;
  onSuccess?: () => void;
}

interface ParsedData {
  validRows: IGuestImportRow[];
  errors: Array<{ row: number; errors: string[] }>;
}

export default NiceModal.create(
  ({ tenantId, onSuccess }: GuestImportModalProps) => {
    const modal = useModal();
    const { importGuests, isImporting } = useImportGuests(tenantId);

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [importResult, setImportResult] = useState<{
      imported: number;
      failed: number;
      errors: Array<{ row: number; errors: string[] }>;
    } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Handle file selection and parsing
    const handleFileChange = async (info: any) => {
      const { fileList: newFileList } = info;
      setFileList(newFileList.slice(-1)); // Keep only the last file

      if (newFileList.length > 0) {
        const file = newFileList[0].originFileObj;
        if (file) {
          setIsProcessing(true);
          setParsedData(null);
          setImportResult(null);

          try {
            const result = await parseGuestFile(file);
            setParsedData({
              validRows: result.data,
              errors: result.errors,
            });
          } catch (error) {
            console.error('Error parsing file:', error);
            setParsedData({
              validRows: [],
              errors: [
                {
                  row: 0,
                  errors: [
                    error instanceof Error
                      ? error.message
                      : 'Failed to parse file',
                  ],
                },
              ],
            });
          } finally {
            setIsProcessing(false);
          }
        }
      } else {
        setParsedData(null);
        setImportResult(null);
      }
    };

    // Handle import submission
    const handleImport = async () => {
      if (!fileList[0]?.originFileObj) return;

      try {
        const result = await importGuests(fileList[0].originFileObj as File);
        setImportResult(result);

        // If import was successful (even with some failures), trigger refresh
        if (result.imported > 0) {
          onSuccess?.();
        }
      } catch (error) {
        console.error('Error importing guests:', error);
      }
    };

    // Handle modal close
    const handleClose = () => {
      setFileList([]);
      setParsedData(null);
      setImportResult(null);
      modal.hide();
    };

    // Check if we can proceed with import
    const canImport =
      parsedData &&
      parsedData.validRows.length > 0 &&
      !importResult &&
      !isProcessing;

    // Columns for error table
    const errorColumns = [
      {
        title: 'Row',
        dataIndex: 'row',
        key: 'row',
        width: 80,
      },
      {
        title: 'Errors',
        dataIndex: 'errors',
        key: 'errors',
        render: (errors: string[]) => (
          <div>
            {errors.map((error, index) => (
              <div key={index} style={{ color: '#ff4d4f' }}>
                • {error}
              </div>
            ))}
          </div>
        ),
      },
    ];

    return (
      <Modal
        title="Import Guests"
        open={modal.visible}
        onCancel={handleClose}
        width={800}
        destroyOnClose
        footer={
          <Space>
            <Button onClick={handleClose}>
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            {!importResult && (
              <Button
                type="primary"
                onClick={handleImport}
                loading={isImporting}
                disabled={!canImport}
              >
                {isImporting ? 'Importing...' : 'Import Guests'}
              </Button>
            )}
          </Space>
        }
      >
        {/* File Upload Section */}
        {!importResult && (
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
                    <strong>Required columns:</strong> name, relationship,
                    attendance
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

            <Upload
              fileList={fileList}
              onChange={handleFileChange}
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
            {fileList.length === 0 && (
              <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 8 }}>
                Select a CSV or Excel file to import guests
              </div>
            )}
          </>
        )}

        {/* Preview Section */}
        {parsedData && !importResult && (
          <>
            <Divider />
            <Title level={5}>Import Preview</Title>

            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col xs={24} sm={12}>
                <Card size="small" style={{ height: '100%' }}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <CheckCircleOutlined
                      style={{ fontSize: 28, color: '#52c41a' }}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Text strong style={{ fontSize: 24 }}>
                        {parsedData.validRows.length}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>Valid Rows</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card size="small" style={{ height: '100%' }}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <CloseCircleOutlined
                      style={{ fontSize: 28, color: '#ff4d4f' }}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Text strong style={{ fontSize: 24 }}>
                        {parsedData.errors.length}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>Errors</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {parsedData.errors.length > 0 && (
              <>
                <Alert
                  message="Validation Errors"
                  description="The following rows have errors and will not be imported. Please fix these errors in your file and try again."
                  type="warning"
                  style={{ marginBottom: 16 }}
                />
                <Table
                  dataSource={parsedData.errors}
                  columns={errorColumns}
                  rowKey="row"
                  pagination={false}
                  size="small"
                  scroll={{ y: 200 }}
                />
              </>
            )}

            {parsedData.validRows.length === 0 && (
              <Alert
                message="No Valid Rows"
                description="No valid rows found in the file. Please fix the errors and try again."
                type="error"
                style={{ marginTop: 16 }}
              />
            )}
          </>
        )}

        {/* Import Results Section */}
        {importResult && (
          <>
            <Divider />
            <Title level={5}>Import Results</Title>

            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col xs={24} sm={12}>
                <Card size="small" style={{ height: '100%' }}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <CheckCircleOutlined
                      style={{ fontSize: 28, color: '#52c41a' }}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Text strong style={{ fontSize: 24 }}>
                        {importResult.imported}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>Successfully Imported</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card size="small" style={{ height: '100%' }}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <CloseCircleOutlined
                      style={{ fontSize: 28, color: '#ff4d4f' }}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Text strong style={{ fontSize: 24 }}>
                        {importResult.failed}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>Failed</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {importResult.imported > 0 && (
              <Alert
                message="Import Successful"
                description={`Successfully imported ${importResult.imported} guest${importResult.imported > 1 ? 's' : ''}.`}
                type="success"
                style={{ marginBottom: 16 }}
              />
            )}

            {importResult.failed > 0 && importResult.errors.length > 0 && (
              <>
                <Alert
                  message="Some Rows Failed"
                  description={`${importResult.failed} row${importResult.failed > 1 ? 's' : ''} failed to import due to errors.`}
                  type="warning"
                  style={{ marginBottom: 16 }}
                />
                <Table
                  dataSource={importResult.errors}
                  columns={errorColumns}
                  rowKey="row"
                  pagination={false}
                  size="small"
                  scroll={{ y: 200 }}
                />
              </>
            )}
          </>
        )}
      </Modal>
    );
  }
);
