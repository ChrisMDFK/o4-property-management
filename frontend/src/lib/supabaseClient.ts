import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少環境變數：VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ---- JWT payload 型別 ----
export interface AuthUser {
  company_id: string;
  role: 'company_admin' | 'manager' | 'resident_viewer';
  user_id?: string;
  community_id?: string; // 可選：若你的 JWT 也會帶預設社區
}

// 解析 JWT payload（不驗簽，僅前端顯示/取值用）
const parseJwt = (token: string): any | null => {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// 設定自簽 JWT（若你是外部簽發 JWT）
export const setAuthToken = async (jwt: string) => {
  const { data, error } = await supabase.auth.setSession({
    access_token: jwt,
    refresh_token: '' // 自簽 JWT 不需要 refresh_token
  });
  if (error) throw error;
  return data;
};

export const clearAuth = async () => {
  await supabase.auth.signOut();
};

// 非同步取得目前使用者（從 session 的 access_token 解出）
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  const token = data?.session?.access_token;
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload?.company_id || !payload?.role) return null;

  return {
    company_id: payload.company_id,
    role: payload.role,
    user_id: payload.sub,
    community_id: payload.community_id ?? undefined
  };
};

// 統一錯誤訊息（繁中）
export const handleSupabaseError = (error: any): string => {
  if (!error) return '';
  const message = error.message || String(error);
  const M: Record<string, string> = {
    'JWT expired': 'JWT 已過期，請重新登入',
    'Invalid JWT': 'JWT 無效，請重新登入',
    'Row Level Security': '權限不足，無法存取此資料',
    'duplicate key': '資料重複，請檢查輸入內容',
    'foreign key': '關聯資料不存在',
    'not null': '必填欄位不能為空'
  };
  for (const k of Object.keys(M)) if (message.includes(k)) return M[k];
  return `操作失敗: ${message}`;
};