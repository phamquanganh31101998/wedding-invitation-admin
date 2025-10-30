'use client';

import { ConfigProvider } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import AuthSessionProvider from '@/components/providers/SessionProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthSessionProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <NiceModal.Provider>
          {children}
        </NiceModal.Provider>
      </ConfigProvider>
    </AuthSessionProvider>
  );
}