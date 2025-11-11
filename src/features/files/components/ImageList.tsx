'use client';

import { Row, Col, Image, Button, Card, Popconfirm } from 'antd';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IFile } from '@/types/file';

interface ImageListProps {
  imageFiles: IFile[];
  loading: boolean;
  onDelete: (file: IFile) => void;
  onReorder: (files: IFile[]) => void;
}

interface SortableImageItemProps {
  file: IFile;
  onDelete: (file: IFile) => void;
}

const SortableImageItem = ({ file, onDelete }: SortableImageItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: file.id });

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
                  cursor: 'grab',
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

export default function ImageList({
  imageFiles,
  loading,
  onDelete,
  onReorder,
}: ImageListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = imageFiles.findIndex(
        (file: IFile) => file.id === active.id
      );
      const newIndex = imageFiles.findIndex(
        (file: IFile) => file.id === over.id
      );

      const newImageFiles = arrayMove(imageFiles, oldIndex, newIndex);
      onReorder(newImageFiles);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={imageFiles.map((f: IFile) => f.id)}
        strategy={rectSortingStrategy}
      >
        <Row gutter={[16, 16]} style={{ minHeight: loading ? 100 : 'auto' }}>
          {loading ? (
            <Col span={24} style={{ textAlign: 'center', padding: 40 }}>
              Loading images...
            </Col>
          ) : imageFiles.length === 0 ? (
            <Col
              span={24}
              style={{ textAlign: 'center', padding: 40, color: '#999' }}
            >
              No images uploaded yet
            </Col>
          ) : (
            imageFiles.map((file: IFile) => (
              <Col key={file.id} xs={24} sm={12} md={8} lg={6}>
                <SortableImageItem file={file} onDelete={onDelete} />
              </Col>
            ))
          )}
        </Row>
      </SortableContext>
    </DndContext>
  );
}
