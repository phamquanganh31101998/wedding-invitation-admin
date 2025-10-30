'use client';

import { Card, Row, Col, Typography, Divider, Space } from 'antd';
import { TenantUI } from '@/types/tenant';
import { FileUpload } from '@/components/common/FileUpload';

const { Title, Text } = Typography;

interface FilesTabProps {
  tenant: TenantUI;
  onFileUploadSuccess?: () => void;
}

export default function FilesTab({ tenant, onFileUploadSuccess }: FilesTabProps) {
  const handleFileUpload = (fileType: string) => (url: string) => {
    console.log(`${fileType} uploaded:`, url);
    onFileUploadSuccess?.();
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={4}>Wedding Media Files</Title>
      <Text type="secondary">
        Upload and manage images and audio files for the wedding invitation.
      </Text>

      <Divider />

      <Row gutter={[24, 24]}>
        {/* Couple Photo */}
        <Col xs={24} md={12} lg={8}>
          <Card title="Couple Photo" size="small">
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Main photo of the bride and groom for the invitation
            </Text>
            <FileUpload
              tenantId={tenant.id}
              fileType="couple_photo"
              fileName={`${tenant.brideName} & ${tenant.groomName}`}
              onUploadSuccess={handleFileUpload('couple_photo')}
              maxWidth={250}
              maxHeight={300}
              acceptedTypes="image/*"
              isImageOnly={true}
            />
          </Card>
        </Col>

        {/* Venue Photo */}
        <Col xs={24} md={12} lg={8}>
          <Card title="Venue Photo" size="small">
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Photo of the wedding venue
            </Text>
            <FileUpload
              tenantId={tenant.id}
              fileType="venue_photo"
              fileName={`${tenant.venueName} venue`}
              onUploadSuccess={handleFileUpload('venue_photo')}
              maxWidth={250}
              maxHeight={200}
              acceptedTypes="image/*"
              isImageOnly={true}
            />
          </Card>
        </Col>

        {/* Background Image */}
        <Col xs={24} md={12} lg={8}>
          <Card title="Background Image" size="small">
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Custom background image for the invitation theme
            </Text>
            <FileUpload
              tenantId={tenant.id}
              fileType="background_image"
              fileName="Wedding invitation background"
              onUploadSuccess={handleFileUpload('background_image')}
              maxWidth={250}
              maxHeight={200}
              acceptedTypes="image/*"
              isImageOnly={true}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Audio Files Section */}
      <div style={{ marginTop: 32 }}>
        <Title level={5}>Wedding Music</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Upload background music or audio files for the wedding invitation
        </Text>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card title="Background Music" size="small">
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Background music for the invitation
              </Text>
              <FileUpload
                tenantId={tenant.id}
                fileType="background_music"
                fileName="Wedding background music"
                onUploadSuccess={handleFileUpload('background_music')}
                maxWidth={250}
                maxHeight={100}
                acceptedTypes="audio/*"
                isImageOnly={false}
                showPreview={true}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card size="small" style={{ textAlign: 'center', minHeight: 200 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 150,
                color: '#999'
              }}>
                <Space direction="vertical" align="center">
                  <Text type="secondary">Additional Audio</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Coming Soon
                  </Text>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Gallery Images Section */}
      <div style={{ marginTop: 32 }}>
        <Title level={5}>Gallery Images</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Additional photos for the wedding gallery
        </Text>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card title="Gallery Photo 1" size="small">
              <FileUpload
                tenantId={tenant.id}
                fileType="gallery_photo"
                fileName="Gallery photo"
                onUploadSuccess={handleFileUpload('gallery_photo')}
                maxWidth={200}
                maxHeight={150}
                acceptedTypes="image/*"
                isImageOnly={true}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card size="small" style={{ textAlign: 'center', minHeight: 200 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 150,
                color: '#999'
              }}>
                <Space direction="vertical" align="center">
                  <Text type="secondary">More Gallery</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Coming Soon
                  </Text>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}