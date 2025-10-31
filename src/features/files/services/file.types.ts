export interface IGetFileListParams {
  fileTypes?: string;
}

export interface IUploadFileBody {
  file: File;
  fileType: string;
  fileName?: string;
  displayOrder?: number;
}
