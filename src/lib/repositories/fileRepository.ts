import { db } from '@/lib/db';

export interface TenantFile {
  id: number;
  tenantId: number;
  type: string;
  url: string;
  name?: string;
  displayOrder: number;
  createdAt: Date;
}

export class FileRepository {
  /**
   * Save file reference to database
   */
  static async saveFileReference(
    tenantId: number,
    url: string,
    type: string,
    name?: string,
    displayOrder: number = 0
  ): Promise<TenantFile> {
    const query = `
      INSERT INTO files (tenant_id, type, url, name, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, tenant_id as "tenantId", type, url, name, 
                display_order as "displayOrder", created_at as "createdAt"
    `;

    try {
      const result = await db.query(query, [
        tenantId,
        type,
        url,
        name,
        displayOrder,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error saving file reference:', error);
      throw new Error('Failed to save file reference');
    }
  }

  /**
   * Get all files for a tenant
   */
  static async getFilesByTenant(tenantId: number): Promise<TenantFile[]> {
    const query = `
      SELECT id, tenant_id as "tenantId", type, url, name, 
             display_order as "displayOrder", created_at as "createdAt"
      FROM files 
      WHERE tenant_id = $1 
      ORDER BY type, display_order, created_at
    `;

    try {
      const result = await db.query(query, [tenantId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching tenant files:', error);
      throw new Error('Failed to fetch tenant files');
    }
  }

  /**
   * Get files by type for a tenant
   */
  static async getFilesByType(
    tenantId: number,
    type: string
  ): Promise<TenantFile[]> {
    const query = `
      SELECT id, tenant_id as "tenantId", type, url, name, 
             display_order as "displayOrder", created_at as "createdAt"
      FROM files 
      WHERE tenant_id = $1 AND type = $2
      ORDER BY display_order, created_at
    `;

    try {
      const result = await db.query(query, [tenantId, type]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching files by type:', error);
      throw new Error('Failed to fetch files by type');
    }
  }

  /**
   * Delete file reference from database
   */
  static async deleteFileReference(fileId: number): Promise<void> {
    const query = `DELETE FROM files WHERE id = $1`;

    try {
      await db.query(query, [fileId]);
    } catch (error) {
      console.error('Error deleting file reference:', error);
      throw new Error('Failed to delete file reference');
    }
  }

  /**
   * Update file metadata
   */
  static async updateFileMetadata(
    fileId: number,
    name?: string,
    displayOrder?: number
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (displayOrder !== undefined) {
      updates.push(`display_order = $${paramIndex++}`);
      values.push(displayOrder);
    }

    if (updates.length === 0) return;

    values.push(fileId);
    const query = `
      UPDATE files 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;

    try {
      await db.query(query, values);
    } catch (error) {
      console.error('Error updating file metadata:', error);
      throw new Error('Failed to update file metadata');
    }
  }

  /**
   * Get file by ID
   */
  static async getFileById(fileId: number): Promise<TenantFile | null> {
    const query = `
      SELECT id, tenant_id as "tenantId", type, url, name, 
             display_order as "displayOrder", created_at as "createdAt"
      FROM files 
      WHERE id = $1
    `;

    try {
      const result = await db.query(query, [fileId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching file by ID:', error);
      throw new Error('Failed to fetch file');
    }
  }
}
