export interface IFile {
  id: number;
  tenantId: number;
  type: string;
  url: string;
  name?: string;
  displayOrder: number;
  createdAt: Date;
}
