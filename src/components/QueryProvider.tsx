'use client';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { get, set, del } from 'idb-keyval';
import { useState } from 'react';

const asyncStoragePersister = {
  persistClient: async (client: unknown) => {
    await set('REACT_QUERY_OFFLINE_CACHE', client);
  },
  restoreClient: async () => {
    return await get('REACT_QUERY_OFFLINE_CACHE');
  },
  removeClient: async () => {
    await del('REACT_QUERY_OFFLINE_CACHE');
  },
};

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days for offline
            retry: 2,
            refetchOnWindowFocus: true,
            networkMode: 'offlineFirst',
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
