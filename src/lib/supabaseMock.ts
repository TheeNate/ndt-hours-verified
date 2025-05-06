// src/lib/supabaseMock.ts

// A no-op query chain for table operations:
type QueryChain<T = any> = {
    select: (..._: any[]) => Promise<{ data: T[]; error: null }>;
    eq: (..._: any[]) => QueryChain<T>;
    order: (..._: any[]) => QueryChain<T>;
    insert: (_: any) => Promise<{ data: T[]; error: null }>;
    update: (_: any) => Promise<{ data: T[]; error: null }>;
    delete: () => Promise<{ data: T[]; error: null }>;
  };
  
  function builder<T = any>(): QueryChain<T> {
    const chain: any = {
      select: () => Promise.resolve({ data: [] as T[], error: null }),
      eq: () => chain,
      order: () => chain,
      insert: () => Promise.resolve({ data: [] as T[], error: null }),
      update: () => Promise.resolve({ data: [] as T[], error: null }),
      delete: () => Promise.resolve({ data: [] as T[], error: null }),
    };
    return chain;
  }
  
  // A fake user for auth
  const fakeUser = {
    id: "mock-user-id",
    email: "test@local.dev",
    user_metadata: {},
    // add any other fields your app expects...
  };
  
  // Stubbed auth API:
  const authMock = {
    getSession: async () => ({
      data: { session: { user: fakeUser } },
      error: null,
    }),
    getUser: async () => ({
      data: { user: fakeUser },
      error: null,
    }),
    onAuthStateChange: (cb: (event: string, session: any) => void) => {
      // Immediately signal that we're signed in with the fake user
      cb("SIGNED_IN", { session: { user: fakeUser } });
      return { data: { subscription: { unsubscribe: () => {} } }, error: null };
    },
    signInWithPassword: async (_: any) => ({
      data: { user: fakeUser, session: { user: fakeUser } },
      error: null,
    }),
    signOut: async () => ({ error: null }),
  };
  
  export const supabase = {
    from: builder(),
    auth: authMock,
  };
  