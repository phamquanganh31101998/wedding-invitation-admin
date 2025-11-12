'use client';

import { Alert, Button, Typography, Divider, Row, Col, Card } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface ImportResultProps {
  imported: number;
  failed: number;
  resultFile?: Blob;
  onDownloadResult: () => void;
}

export default function ImportResult({
  imported,
  failed,
  resultFile,
  onDownloadResult,
}: ImportResultProps) {
  return (
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
                  {imported}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Successfully Imported
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
                  {failed}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Failed
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {imported > 0 && (
        <Alert
          message="Import Successful"
          description={`Successfully imported ${imported} guest${imported > 1 ? 's' : ''}.`}
          type="success"
          style={{ marginBottom: 16 }}
        />
      )}

      {failed > 0 && (
        <Alert
          message="Some Rows Failed"
          description={`${failed} row${failed > 1 ? 's' : ''} failed to import due to errors.`}
          type="warning"
          style={{ marginBottom: 16 }}
        />
      )}

      {resultFile && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button type="link" onClick={onDownloadResult} size="large">
            Download import result
          </Button>
          <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>
            The file contains two sheets: Success and Failed rows
          </div>
        </div>
      )}
    </>
  );
}
