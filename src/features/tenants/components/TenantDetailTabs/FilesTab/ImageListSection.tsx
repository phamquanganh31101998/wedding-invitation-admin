'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Image, Button, Typography, message, Popconfirm } from 'antd';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileUpload } from '@/components/common/FileUpload';
import { TenantFile } from '@/lib/repositories/file-repository';

const { Title, Text } = Typography;

interface ImageListSectionProps {
  tenantId: number;
  onFileUploadSuccess?: () => void;
}

interface SortableImageItemProps {
  file: TenantFile;
  onDelete: (file: TenantFile) => void;
}

const SortableImageItem = ({ file, onDelete }: SortableImageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        size="small"
        style={{ position: 'relative' }}
        cover={
          <div style={{ position: 'relative' }}>
            <Image
              src={file.url}
              alt={file.name || 'Gallery image'}
              style={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
              }}
              preview={{
                mask: 'Preview',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 4,
              }}
            >
              <Popconfirm
                title="Delete this image?"
                onConfirm={() => onDelete(file)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                />
              </Popconfirm>
              <Button
                type="text"
                icon={<DragOutlined />}
                size="small"
                {...listeners}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'grab'
                }}
              />
            </div>
          </div>
        }
      >
        <Card.Meta
          title={file.name || 'Gallery Image'}
          description={`Order: ${file.displayOrder}`}
        />
      </Card>
    </div>
  );
};

export default function ImageListSection({ tenantId, onFileUploadSuccess }: ImageListSectionProps) {
  const [imageFiles, setImageFiles] = useState<TenantFile[]>([]);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchImageFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tenants/${tenantId}/files?type=image`);
      const result = await response.json();
      if (result.success) {
        setImageFiles(result.files);
      }
    } catch (error) {
      console.error('Error fetching image files:', error);
      message.error('Failed to fetch image files');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchImageFiles();
  }, [fetchImageFiles]);

  const handleFileUpload = (url: string) => {
    fetchImageFiles();
    onFileUploadSuccess?.();
  };

  const handleDelete = async (file: TenantFile) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/files?fileId=${file.id}&fileUrl=${encodeURIComponent(file.url)}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        message.success('Image deleted successfully');
        fetchImageFiles();
      } else {
        message.error(result.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      message.error('Failed to delete image');
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = imageFiles.findIndex((file) => file.id === active.id);
      const newIndex = imageFiles.findIndex((file) => file.id === over.id);

      const newImageFiles = arrayMove(imageFiles, oldIndex, newIndex);
      setImageFiles(newImageFiles);

      // Update display order in backend
      try {
        const updatePromises = newImageFiles.map((file, index) =>
          fetch(`/api/tenants/${tenantId}/files/${file.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayOrder: index }),
          })
        );

        await Promise.all(updatePromises);
        message.success('Image order updated successfully');
      } catch (error) {
        console.error('Error updating image order:', error);
        message.error('Failed to update image order');
        fetchImageFiles(); // Revert on error
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Title level={5} style={{ margin: 0 }}>Gallery Images</Title>
        <FileUpload
          tenantId={tenantId}
          fileType="image"
          fileName="Gallery photo"
          onUploadSuccess={handleFileUpload}
          maxWidth={200}
          maxHeight={150}
          acceptedTypes="image/*"
          showPreview={false}
        />
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Upload and manage photos for the wedding gallery
      </Text>

      <Card title="Gallery Images" size="small">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={imageFiles.map(f => f.id)} strategy={rectSortingStrategy}>
            <Row gutter={[16, 16]} style={{ minHeight: loading ? 100 : 'auto' }}>
              {loading ? (
                <Col span={24} style={{ textAlign: 'center', padding: 40 }}>
                  Loading images...
                </Col>
              ) : imageFiles.length === 0 ? (
                <Col span={24} style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  No images uploaded yet
                </Col>
              ) : (
                imageFiles.map((file) => (
                  <Col key={file.id} xs={24} sm={12} md={8} lg={6}>
                    <SortableImageItem
                      file={file}
                      onDelete={handleDelete}
                    />
                  </Col>
                ))
              )}
            </Row>
          </SortableContext>
        </DndContext>
      </Card>
    </div>
  );
}