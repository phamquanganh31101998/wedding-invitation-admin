'use client';

import { Alert, Table, Typography, Divider, Row, Col, Card } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { IGuestImportRow } from '@/features/guests/services/guest.types';

const { Text, Title } = Typography;

interface PreviewParsedDataProps {
  validRows: IGuestImportRow[];
  errors: Array<{ row: number; errors: string[] }>;
}

export default function PreviewParsedData({
  validRows,
  errors,
}: PreviewParsedDataProps) {
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
                  {validRows.length}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Valid Rows
              </Text>
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
                  {errors.length}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Errors
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {errors.length > 0 && (
        <>
          <Alert
            message="Validation Errors"
            description="The following rows have errors and will not be imported. Please fix these errors in your file and try again."
            type="warning"
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSource={errors}
            columns={errorColumns}
            rowKey="row"
            pagination={false}
            size="small"
            scroll={{ y: 200 }}
          />
        </>
      )}

      {validRows.length === 0 && (
        <Alert
          message="No Valid Rows"
          description="No valid rows found in the file. Please fix the errors and try again."
          type="error"
          style={{ marginTop: 16 }}
        />
      )}
    </>
  );
}
