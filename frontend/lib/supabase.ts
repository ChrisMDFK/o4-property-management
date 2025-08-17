import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key-placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Resident {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  notes?: string;
  company_id: string;
  created_at: string;
  balance?: number;
}

export interface PointLedger {
  id: string;
  resident_id: string;
  resident_name?: string;
  item_name: string;
  points: number;
  notes?: string;
  created_at: string;
  company_id: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  company_id: string;
}

export interface FacilityUsage {
  id: string;
  resident_id: string;
  resident_name?: string;
  facility_name: string;
  points_deducted: number;
  created_at: string;
  company_id: string;
}

export interface DaySummary {
  total_deductions: number;
  total_additions: number;
  registrations_count: number;
}

export interface AuthUser {
  company_id: string;
  role: string;
  jwt: string;
}

// Facility constants
export const FACILITY_POINTS = {
  '游泳池': -5,
  '健身房': -3,
  '會議室': -8,
  '烤肉區': -10,
  '停車場': -2,
  '籃球場': -4,
  '網球場': -6,
};

export const getAuthUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  
  const jwt = localStorage.getItem('SUPABASE_JWT');
  const companyId = localStorage.getItem('COMPANY_ID');
  const role = localStorage.getItem('USER_ROLE');
  
  if (!jwt || !companyId || !role) return null;
  
  return { jwt, company_id: companyId, role };
};

export const setAuthUser = (user: AuthUser) => {
  localStorage.setItem('SUPABASE_JWT', user.jwt);
  localStorage.setItem('COMPANY_ID', user.company_id);
  localStorage.setItem('USER_ROLE', user.role);
  
  // Set session for Supabase
  supabase.auth.setSession({ access_token: user.jwt, refresh_token: '' } as any);
};

export const clearAuthUser = () => {
  localStorage.removeItem('SUPABASE_JWT');
  localStorage.removeItem('COMPANY_ID');
  localStorage.removeItem('USER_ROLE');
  supabase.auth.signOut();
};

// Mock data for development
export const mockResidents: Resident[] = [
  {
    id: '1',
    name: '王小明',
    address: 'A棟101',
    phone: '0912-345-678',
    email: 'wang@example.com',
    notes: '長期住戶',
    company_id: 'demo-company',
    created_at: new Date().toISOString(),
    balance: 50,
  },
  {
    id: '2',
    name: '李美華',
    address: 'B棟203',
    phone: '0987-654-321',
    email: 'li@example.com',
    notes: '',
    company_id: 'demo-company',
    created_at: new Date().toISOString(),
    balance: 25,
  },
  {
    id: '3',
    name: '張大偉',
    address: 'C棟305',
    phone: '0956-789-123',
    email: 'zhang@example.com',
    notes: '新住戶',
    company_id: 'demo-company',
    created_at: new Date().toISOString(),
    balance: 75,
  },
];

export const mockLedger: PointLedger[] = [
  {
    id: '1',
    resident_id: '1',
    resident_name: '王小明',
    item_name: '游泳池使用',
    points: -5,
    notes: '每日使用',
    created_at: new Date().toISOString(),
    company_id: 'demo-company',
  },
  {
    id: '2',
    resident_id: '2',
    resident_name: '李美華',
    item_name: '活動贈點',
    points: 20,
    notes: '參與社區活動',
    created_at: new Date().toISOString(),
    company_id: 'demo-company',
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '游泳池維護通知',
    content: '游泳池將於下週一進行維護，暫停開放一天。',
    is_published: true,
    created_at: new Date().toISOString(),
    company_id: 'demo-company',
  },
  {
    id: '2',
    title: '社區活動邀請',
    content: '本月底將舉辦社區聚餐活動，歡迎住戶參加。',
    is_published: false,
    created_at: new Date().toISOString(),
    company_id: 'demo-company',
  },
];