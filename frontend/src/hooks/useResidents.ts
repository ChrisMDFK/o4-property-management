import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError, getCurrentUser } from '../lib/supabaseClient';
import { Resident, ResidentFormData, ResidentFilters } from '../types/database';

export const useResidents = (filters: ResidentFilters = {}) => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchResidents = useCallback(async () => {
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
        .from('residents')
        .select('*', { count: 'exact' })
        .eq('company_id', currentUser.company_id);

      // 如有 community 篩選
      if (filters.community_id) {
        query = query.eq('community_id', filters.community_id);
      } else if (currentUser.community_id) {
        // 若 JWT 有預設社區，預設以 JWT 社區過濾
        query = query.eq('community_id', currentUser.community_id);
      }

      // 搜尋 name / address / unit_number
      if (filters.search) {
        const s = filters.search;
        query = query.or(`name.ilike.%${s}%,address.ilike.%${s}%,unit_number.ilike.%${s}%`);
      }

      // 排序
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // 分頁
      if (typeof filters.offset === 'number' && typeof filters.limit === 'number') {
        query = query.range(filters.offset, filters.offset + filters.limit - 1);
      } else if (typeof filters.limit === 'number') {
        query = query.limit(filters.limit);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setResidents(data || []);
      setTotal(count || 0);
    } catch (err) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  }, [filters.community_id, filters.search, filters.sortBy, filters.sortOrder, filters.limit, filters.offset]);

  const createResident = async (formData: ResidentFormData): Promise<Resident | null> => {
    const currentUser = await getCurrentUser();
    if (!currentUser?.company_id) throw new Error('未找到公司資訊，請重新登入');

    if (!formData.community_id) throw new Error('請選擇社區');

    try {
      const payload = {
        company_id: currentUser.company_id,
        community_id: formData.community_id,
        name: formData.name,
        unit_number: formData.unit_number,
        phone: formData.phone ?? null,
        address: formData.address ?? null,
        email: formData.email ?? null,
        notes: formData.notes ?? null
      };

      const { data, error } = await supabase.from('residents').insert(payload).select().single();
      if (error) throw error;

      setResidents(prev => [data, ...prev]);
      setTotal(prev => prev + 1);
      return data;
    } catch (err) {
      throw new Error(handleSupabaseError(err));
    }
  };

  const updateResident = async (id: string, formData: Partial<ResidentFormData>): Promise<Resident | null> => {
    try {
      const patch: any = {
        updated_at: new Date().toISOString()
      };
      if (formData.name !== undefined) patch.name = formData.name;
      if (formData.unit_number !== undefined) patch.unit_number = formData.unit_number;
      if (formData.phone !== undefined) patch.phone = formData.phone;
      if (formData.address !== undefined) patch.address = formData.address;
      if (formData.email !== undefined) patch.email = formData.email;
      if (formData.notes !== undefined) patch.notes = formData.notes;
      if (formData.community_id !== undefined) patch.community_id = formData.community_id;

      const { data, error } = await supabase
        .from('residents')
        .update(patch)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setResidents(prev => prev.map(r => (r.id === id ? data : r)));
      return data;
    } catch (err) {
      throw new Error(handleSupabaseError(err));
    }
  };

  const deleteResident = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('residents').delete().eq('id', id);
      if (error) throw error;
      setResidents(prev => prev.filter(r => r.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      throw new Error(handleSupabaseError(err));
    }
  };

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  return { residents, loading, error, total, refetch: fetchResidents, createResident, updateResident, deleteResident };
};