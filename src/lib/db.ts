import { neon } from '@neondatabase/serverless';

// Use the pooled connection for better performance
const sql = neon(process.env.DATABASE_URL!);

export { sql };

// For transactions or when you need a persistent connection
export const getDbConnection = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }
  return neon(process.env.DATABASE_URL);
};
