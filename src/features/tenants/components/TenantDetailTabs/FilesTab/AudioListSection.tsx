'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, List, Button, Typography, message, Popconfirm } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileUpload } from '@/components/common/FileUpload';
import { TenantFile } from '@/lib/repositories/file-repository';

const { Title, Text } = Typography;

interface AudioListSectionProps {
  tenantId: number;
  onFileUploadSuccess?: () => void;
}

interface SortableAudioItemProps {
  file: TenantFile;
  isPlaying: boolean;
  onPlay: (file: TenantFile) => void;
  onPause: () => void;
  onDelete: (file: TenantFile) => void;
}

const SortableAudioItem = ({ file, isPlaying, onPlay, onPause, onDelete }: SortableAudioItemProps) => {
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
      <List.Item
        actions={[
          <Button
            key="play"
            type="text"
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => isPlaying ? onPause() : onPlay(file)}
          />,
          <Popconfirm
            key="delete"
            title="Delete this audio file?"
            onConfirm={() => onDelete(file)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>,
          <Button
            key="drag"
            type="text"
            icon={<DragOutlined />}
            {...listeners}
            style={{ cursor: 'grab' }}
          />
        ]}
      >
        <List.Item.Meta
          title={file.name || 'Audio File'}
          description={`Order: ${file.displayOrder}`}
        />
      </List.Item>
    </div>
  );
};

export default function AudioListSection({ tenantId, onFileUploadSuccess }: AudioListSectionProps) {
  const [audioFiles, setAudioFiles] = useState<TenantFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingFileId, setPlayingFileId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchAudioFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tenants/${tenantId}/files?type=music`);
      const result = await response.json();
      if (result.success) {
        setAudioFiles(result.files);
      }
    } catch (error) {
      console.error('Error fetching audio files:', error);
      message.error('Failed to fetch audio files');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchAudioFiles();
  }, [fetchAudioFiles]);

  const handleFileUpload = (url: string) => {
    fetchAudioFiles();
    onFileUploadSuccess?.();
  };

  const handlePlay = (file: TenantFile) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(file.url);
    audio.play();
    setCurrentAudio(audio);
    setPlayingFileId(file.id);

    audio.onended = () => {
      setPlayingFileId(null);
      setCurrentAudio(null);
    };
  };

  const handlePause = () => {
    if (currentAudio) {
      currentAudio.pause();
      setPlayingFileId(null);
      setCurrentAudio(null);
    }
  };

  const handleDelete = async (file: TenantFile) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/files?fileId=${file.id}&fileUrl=${encodeURIComponent(file.url)}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        message.success('Audio file deleted successfully');
        fetchAudioFiles();
      } else {
        message.error(result.error || 'Failed to delete audio file');
      }
    } catch (error) {
      console.error('Error deleting audio file:', error);
      message.error('Failed to delete audio file');
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = audioFiles.findIndex((file) => file.id === active.id);
      const newIndex = audioFiles.findIndex((file) => file.id === over.id);

      const newAudioFiles = arrayMove(audioFiles, oldIndex, newIndex);
      setAudioFiles(newAudioFiles);

      // Update display order in backend
      try {
        const updatePromises = newAudioFiles.map((file, index) =>
          fetch(`/api/tenants/${tenantId}/files/${file.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayOrder: index }),
          })
        );

        await Promise.all(updatePromises);
        message.success('Audio order updated successfully');
      } catch (error) {
        console.error('Error updating audio order:', error);
        message.error('Failed to update audio order');
        fetchAudioFiles(); // Revert on error
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Title level={5} style={{ margin: 0 }}>Wedding Music</Title>
        <FileUpload
          tenantId={tenantId}
          fileType="music"
          fileName="Wedding background music"
          onUploadSuccess={handleFileUpload}
          maxWidth={250}
          maxHeight={100}
          acceptedTypes="audio/*"
          showPreview={false}
        />
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Upload and manage background music for the wedding invitation
      </Text>

      <Card title="Audio Files" size="small">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={audioFiles.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <List
              loading={loading}
              dataSource={audioFiles}
              locale={{ emptyText: 'No audio files uploaded yet' }}
              renderItem={(file) => (
                <SortableAudioItem
                  key={file.id}
                  file={file}
                  isPlaying={playingFileId === file.id}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onDelete={handleDelete}
                />
              )}
            />
          </SortableContext>
        </DndContext>
      </Card>
    </div>
  );
}