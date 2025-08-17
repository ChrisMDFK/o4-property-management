'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Resident, FacilityUsage, FACILITY_POINTS, mockResidents } from '@/lib/supabase';

interface FacilityFormProps {
  onDataChange: () => void;
}

export function FacilityForm({ onDataChange }: FacilityFormProps) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [usageHistory, setUsageHistory] = useState<FacilityUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    resident_id: '',
    facility: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setResidents(mockResidents);
      // Mock facility usage history
      const mockUsage: FacilityUsage[] = [
        {
          id: '1',
          resident_id: '1',
          resident_name: '王小明',
          facility_name: '游泳池',
          points_deducted: -5,
          created_at: new Date().toISOString(),
          company_id: 'demo-company',
        },
        {
          id: '2',
          resident_id: '2',
          resident_name: '李美華',
          facility_name: '健身房',
          points_deducted: -3,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          company_id: 'demo-company',
        },
      ];
      setUsageHistory(mockUsage);
    } catch (error) {
      toast.error('載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const selectedFacilityPoints = formData.facility ? FACILITY_POINTS[formData.facility as keyof typeof FACILITY_POINTS] : 0;
  const todayUsage = usageHistory.filter(usage => {
    const usageDate = new Date(usage.created_at).toDateString();
    const today = new Date().toDateString();
    return usageDate === today;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resident_id || !formData.facility) {
      toast.error('請選擇住戶和公設項目');
      return;
    }

    try {
      const selectedResident = residents.find(r => r.id === formData.resident_id);
      const newUsage: FacilityUsage = {
        id: Date.now().toString(),
        resident_id: formData.resident_id,
        resident_name: selectedResident?.name || '',
        facility_name: formData.facility,
        points_deducted: selectedFacilityPoints,
        created_at: new Date().toISOString(),
        company_id: 'demo-company',
      };
      
      setUsageHistory([newUsage, ...usageHistory]);
      setFormData({ resident_id: '', facility: '' });
      toast.success(`已登記 ${formData.facility} 使用，扣除 ${Math.abs(selectedFacilityPoints)} 點`);
      onDataChange();
    } catch (error) {
      toast.error('登記失敗');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>公設登記</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">載入中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>公設使用登記</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resident">選擇住戶</Label>
                <Select value={formData.resident_id} onValueChange={(value) => setFormData({ ...formData, resident_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇住戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {residents.map((resident) => (
                      <SelectItem key={resident.id} value={resident.id}>
                        {resident.name} - {resident.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facility">選擇公設項目</Label>
                <Select value={formData.facility} onValueChange={(value) => setFormData({ ...formData, facility: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇公設項目" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FACILITY_POINTS).map(([facility, points]) => (
                      <SelectItem key={facility} value={facility}>
                        {facility} ({Math.abs(points)} 點)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedFacilityPoints !== 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  將扣除 <strong>{Math.abs(selectedFacilityPoints)} 點</strong>
                </p>
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={!formData.resident_id || !formData.facility}>
              <CheckCircle className="h-4 w-4 mr-2" />
              確認登記
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>今日登記清單</CardTitle>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {todayUsage.length} 筆記錄
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>住戶</TableHead>
                <TableHead>項目</TableHead>
                <TableHead>扣點</TableHead>
                <TableHead>登記時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayUsage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    今日尚無登記記錄
                  </TableCell>
                </TableRow>
              ) : (
                todayUsage.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell className="font-medium">{usage.resident_name}</TableCell>
                    <TableCell>{usage.facility_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {Math.abs(usage.points_deducted)} 點
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(usage.created_at).toLocaleTimeString('zh-TW')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}