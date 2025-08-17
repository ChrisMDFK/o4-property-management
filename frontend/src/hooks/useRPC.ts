import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError, getCurrentUser } from '../lib/supabaseClient';
import { TodayPointSummary } from '../types/database';

export const useResidentBalance = (residentId: string | null, communityId?: string) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!residentId) return;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        // 先試 RPC
        const { data, error } = await supabase.rpc('get_resident_balance', { resident_id: residentId });
        if (!error) {
          setBalance(typeof data === 'number' ? data : 0);
          return;
        }
        // 後備：直接彙總
        const currentUser = await getCurrentUser();
        if (!currentUser?.company_id) throw new Error('未找到公司資訊');

        let q = supabase
          .from('point_ledger')
          .select('points', { head: false })
          .eq('company_id', currentUser.company_id)
          .eq('resident_id', residentId);

        if (communityId) q = q.eq('community_id', communityId);

        const { data: rows, error: qErr } = await q;
        if (qErr) throw qErr;

        const sum = (rows || []).reduce((acc: number, r: any) => acc + (r.points || 0), 0);
        setBalance(sum);
      } catch (err) {
        setError(handleSupabaseError(err));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [residentId, communityId]);

  return { balance, loading, error };
};

export const useTodayPointSummary = (communityId?: string) => {
  const [summary, setSummary] = useState<TodayPointSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.company_id) throw new Error('未找到公司資訊');

        // 先試 RPC（我們會提供包含 community_id 的版本）
        const { data, error } = await supabase.rpc('get_today_point_summary', {
          company_id: currentUser.company_id,
          community_id: communityId ?? currentUser.community_id ?? null
        });

        if (!error && data) {
          setSummary(data as TodayPointSummary);
          return;
        }

        // 後備：前端彙總
        const today = new Date().toISOString().slice(0, 10);
        let q = supabase
          .from('point_ledger')
          .select('points, occurred_at')
          .eq('company_id', currentUser.company_id)
          .gte('occurred_at', `${today}T00:00:00.000Z`)
          .lt('occurred_at', `${today}T23:59:59.999Z`);

        if (communityId) q = q.eq('community_id', communityId);

        const { data: rows, error: qErr } = await q;
        if (qErr) throw qErr;

        const totalAdditions = (rows || []).filter(r => (r.points ?? 0) > 0)
          .reduce((s, r) => s + r.points, 0);
        const totalDeductions = (rows || []).filter(r => (r.points ?? 0) < 0)
          .reduce((s, r) => s + Math.abs(r.points), 0);

        setSummary({
          total_deductions: totalDeductions,
          total_additions: totalAdditions,
          transaction_count: rows?.length || 0,
          date: today
        });
      } catch (err) {
        setError(handleSupabaseError(err));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [communityId]);

  return { summary, loading, error, refetch: () => window.location.reload() };
};