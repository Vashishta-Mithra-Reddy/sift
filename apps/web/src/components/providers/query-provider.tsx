"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QueryClient, type Query } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import localforage from "localforage";
import { authClient } from "@/lib/auth-client";

const shouldPersistQuery = (query: Query) => {
  const key = String(query.queryKey[0] ?? "");
  return ["sift", "flashcards", "learning-path", "learning-path-for-sift"].includes(key);
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? "anonymous";
  const persister = useMemo(
    () =>
      createAsyncStoragePersister({
        storage: localforage,
        key: `sift-query-cache:${userId}`,
      }),
    [userId]
  );
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      })
  );
  const previousUserId = useRef(userId);

  useEffect(() => {
    if (previousUserId.current !== userId) {
      queryClient.clear();
      previousUserId.current = userId;
    }
  }, [queryClient, userId]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 365,
        dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
