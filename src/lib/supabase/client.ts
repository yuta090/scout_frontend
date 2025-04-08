import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  },
  global: {
    headers: { 
      'apikey': supabaseAnonKey,
      'x-application-name': 'scout-management'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// セッション管理の改善
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (session?.access_token) {
      localStorage.setItem('supabase.auth.token', session.access_token);
    }
  } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    localStorage.removeItem('supabase.auth.token');
    window.location.href = '/';
  } else if (event === 'TOKEN_REFRESHED') {
    if (!session) {
      // Token refresh failed
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/';
    }
  }
});

// セッションの自動更新
setInterval(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      if (error || !refreshedSession) {
        // Session refresh failed
        localStorage.removeItem('supabase.auth.token');
        window.location.href = '/';
      }
    }
  } catch (error) {
    console.error('セッション更新エラー:', error);
    localStorage.removeItem('supabase.auth.token');
    window.location.href = '/';
  }
}, 4 * 60 * 1000); // 4分ごとにセッションを更新