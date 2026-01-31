'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { createBrowserClient } from '@/lib/database/client';
import { setUser, setSession, setLoading } from '@/lib/store/features/auth/authSlice';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(null);
  const persistorRef = useRef<any>(null);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
    persistorRef.current = persistStore(storeRef.current);
  }

  useEffect(() => {
    if (!storeRef.current) return;

    const supabase = createBrowserClient();
    const store = storeRef.current;

    const checkUser = async () => {
        store.dispatch(setLoading(true));
        try {
            const { data: { session } } = await supabase.auth.getSession();
            store.dispatch(setSession(session));
            store.dispatch(setUser(session?.user ?? null));
        } catch (error) {
            console.error('Error checking auth session:', error);
        } finally {
            store.dispatch(setLoading(false));
        }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      store.dispatch(setSession(session));
      store.dispatch(setUser(session?.user ?? null));
      store.dispatch(setLoading(false));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current}>
        {children}
      </PersistGate>
    </Provider>
  );
}
