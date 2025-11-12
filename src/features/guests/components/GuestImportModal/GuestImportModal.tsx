'use client';

import { useState } from 'react';
import { Modal, Button, Space } from 'antd';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import type { UploadFile } from 'antd/es/upload/interface';
import { parseGuestFile } from '@/features/guests/services/guest-import.service';
import { useImportGuests } from '@/features/guests/services/guest.hooks';
import { IGuestImportRow } from '@/features/guests/services/guest.types';
import ImportFileUpload from './ImportFileUpload';
import PreviewParsedData from './PreviewParsedData';
import ImportResult from './ImportResult';

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
      resultFile?: Blob;
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
        setImportResult({
          imported: result.imported,
          failed: result.failed,
          errors: result.errors,
          resultFile: result.resultFile,
        });

        // If import was successful (even with some failures), trigger refresh
        if (result.imported > 0) {
          onSuccess?.();
        }
      } catch (error) {
        console.error('Error importing guests:', error);
      }
    };

    // Handle download result file
    const handleDownloadResult = () => {
      if (!importResult?.resultFile) return;

      const url = window.URL.createObjectURL(importResult.resultFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = `import-result-${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
          <ImportFileUpload
            fileList={fileList}
            isProcessing={isProcessing}
            onFileChange={handleFileChange}
          />
        )}

        {/* Preview Section */}
        {parsedData && !importResult && (
          <PreviewParsedData
            validRows={parsedData.validRows}
            errors={parsedData.errors}
          />
        )}

        {/* Import Results Section */}
        {importResult && (
          <ImportResult
            imported={importResult.imported}
            failed={importResult.failed}
            resultFile={importResult.resultFile}
            onDownloadResult={handleDownloadResult}
          />
        )}
      </Modal>
    );
  }
);
