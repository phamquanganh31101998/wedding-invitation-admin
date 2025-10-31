# File Management with React Query

File management has been moved to a dedicated service layer at `src/features/files/services/`.

## New Location

All file-related React Query hooks are now located in:

- `src/features/files/services/file.hooks.ts`
- `src/features/files/services/file.requests.ts`
- `src/features/files/services/file.types.ts`
- `src/features/files/services/file.constants.ts`

## Usage

```tsx
import {
  useGetFileList,
  useDeleteFile,
  useUpdateFileOrder,
  useInvalidateFiles,
} from '@/features/files/services';

function FileComponent({ tenantId }: { tenantId: number }) {
  const { fileList, isLoading } = useGetFileList(tenantId, {
    fileTypes: 'music',
  });
  const { deleteFile } = useDeleteFile(tenantId);
  const { updateFileOrders } = useUpdateFileOrder(tenantId);
  const invalidateFiles = useInvalidateFiles(tenantId);

  // Component logic...
}
```

This provides better organization and separation of concerns by grouping file-related functionality together.
