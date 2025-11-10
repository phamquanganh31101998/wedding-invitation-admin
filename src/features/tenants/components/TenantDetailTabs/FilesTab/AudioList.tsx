'use client';

import { useState } from 'react';
import { List, Button, Popconfirm } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  DragOutlined,
} from '@ant-design/icons';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IFile } from '@/types/file';

interface AudioListProps {
  audioFiles: IFile[];
  loading: boolean;
  onDelete: (file: IFile) => void;
  onReorder: (files: IFile[]) => void;
}

interface SortableAudioItemProps {
  file: IFile;
  isPlaying: boolean;
  onPlay: (file: IFile) => void;
  onPause: () => void;
  onDelete: (file: IFile) => void;
}

const SortableAudioItem = ({
  file,
  isPlaying,
  onPlay,
  onPause,
  onDelete,
}: SortableAudioItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: file.id });

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
            onClick={() => (isPlaying ? onPause() : onPlay(file))}
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
          />,
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

export default function AudioList({
  audioFiles,
  loading,
  onDelete,
  onReorder,
}: AudioListProps) {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [playingFileId, setPlayingFileId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handlePlay = (file: IFile) => {
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = audioFiles.findIndex(
        (file: IFile) => file.id === active.id
      );
      const newIndex = audioFiles.findIndex(
        (file: IFile) => file.id === over.id
      );

      const newAudioFiles = arrayMove(audioFiles, oldIndex, newIndex);
      onReorder(newAudioFiles);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={audioFiles.map((f: IFile) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <List
          loading={loading}
          dataSource={audioFiles}
          locale={{ emptyText: 'No audio files uploaded yet' }}
          renderItem={(file: IFile) => (
            <SortableAudioItem
              key={file.id}
              file={file}
              isPlaying={playingFileId === file.id}
              onPlay={handlePlay}
              onPause={handlePause}
              onDelete={onDelete}
            />
          )}
        />
      </SortableContext>
    </DndContext>
  );
}
