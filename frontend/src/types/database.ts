export interface Resident {
  id: string;
  company_id: string;
  community_id: string;
  name: string;
  unit_number: string;
  phone?: string;
  line_user_id?: string;
  address?: string;
  email?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string | null;
}

export interface PointLedger {
  id: string;
  company_id: string;
  community_id: string;
  resident_id: string;
  item: string;      // 你是 item（不是 facility）
  points: number;    // 你是 points（不是 points_delta）
  created_by?: string | null;
  occurred_at: string;   // 你已經有 occurred_at
  used_at?: string;      // 你也有 used_at（如需）
}

// 彙總/回傳型別
export interface ResidentWithBalance extends Resident {
  current_balance?: number; // 從 RPC 或彙總算出
}

export interface TodayPointSummary {
  total_deductions: number;
  total_additions: number;
  transaction_count: number;
  date: string;
}

// 表單型別
export interface ResidentFormData {
  name: string;
  unit_number: string;
  phone?: string;
  address?: string;
  email?: string;
  notes?: string;
  community_id: string; // 必填：你的表是必填
}

export interface PointDeductionData {
  resident_id: string;
  community_id: string;
  item: string;
  points: number; // 扣點請傳負值或我們在呼叫時轉負
  notes?: string;
}

// 查詢條件
export interface ResidentFilters {
  search?: string;
  sortBy?: 'name' | 'unit_number' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  community_id?: string;
}

export interface LedgerFilters {
  resident_id?: string;
  item?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
  community_id?: string;
}