import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError, getCurrentUser } from '../lib/supabaseClient';
import { PointLedger, PointDeductionData, LedgerFilters } from '../types/database';

export const usePointLedger = (filters: LedgerFilters = {}) => {
  const [ledger, setLedger] = useState<PointLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser?.company_id) {
        setError('未找到公司資訊，請重新登入');
        setLoading(false);
        return;
      }

      let query = supabase
        .from('point_ledger')
        .select(`
          id, company_id, community_id, resident_id, item, points, created_by, occurred_at
        `, { count: 'exact' })
        .eq('company_id', currentUser.company_id);

      if (filters.community_id) {
        query = query.eq('community_id', filters.community_id);
      } else if (currentUser.community_id) {
        query = query.eq('community_id', currentUser.community_id);
      }

      if (filters.resident_id) query = query.eq('resident_id', filters.resident_id);
      if (filters.item) query = query.eq('item', filters.item);
      if (filters.date_from) query = query.gte('occurred_at', filters.date_from);
      if (filters.date_to) query = query.lte('occurred_at', filters.date_to);

      query = query.order('occurred_at', { ascending: false });

      if (typeof filters.offset === 'number' && typeof filters.limit === 'number') {
        query = query.range(filters.offset, filters.offset + filters.limit - 1);
      } else if (typeof filters.limit === 'number') {
        query = query.limit(filters.limit);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setLedger(data || []);
      setTotal(count || 0);
    } catch (err) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  }, [filters.community_id, filters.resident_id, filters.item, filters.date_from, filters.date_to, filters.limit, filters.offset]);

  const deductPoints = async (payload: PointDeductionData): Promise<string | null> => {
    const currentUser = await getCurrentUser();
    if (!currentUser?.company_id) throw new Error('未找到公司資訊，請重新登入');

    if (!payload.community_id) throw new Error('請選擇社區');

    try {
      // 優先呼叫 RPC（對齊你的表：item + points）
      const { data, error } = await supabase.rpc('deduct_resident_points', {
        p_company_id: currentUser.company_id,
        p_community_id: payload.community_id,
        p_resident_id: payload.resident_id,
        p_item: payload.item,
        p_points: payload.points,            // 扣點請傳負值（或由 UI 強制負）
        p_notes: payload.notes ?? null       // 目前表沒有 notes，RPC 忽略此欄
      });

      if (error) throw error;

      // 重抓清單
      await fetchLedger();

      return data as string; // ledger_id
    } catch (err) {
      // 後備方案：直接 insert 到 point_ledger
      try {
        const { data: ins, error: insErr } = await supabase
          .from('point_ledger')
          .insert({
            company_id: currentUser.company_id,
            community_id: payload.community_id,
            resident_id: payload.resident_id,
            item: payload.item,
            points: payload.points, // 負數為扣點
            occurred_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (insErr) throw insErr;

        setLedger(prev => [{ ...(ins as any), ...payload }, ...prev]);
        setTotal(prev => prev + 1);

        return ins?.id ?? null;
      } catch (fallbackErr) {
        throw new Error(handleSupabaseError(fallbackErr));
      }
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return { ledger, loading, error, total, refetch: fetchLedger, deductPoints };
};