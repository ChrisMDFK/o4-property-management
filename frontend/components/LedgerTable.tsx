'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { PointLedger, Resident, mockLedger, mockResidents } from '@/lib/supabase';

interface LedgerTableProps {
  onDataChange: () => void;
}

export function LedgerTable({ onDataChange }: LedgerTableProps) {
  const [ledger, setLedger] = useState<PointLedger[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    resident_id: '',
    reason: '',
    points: '',
    notes: '',
  });

  const adjustmentReasons = [
    { value: '手動調整', label: '手動調整' },
    { value: '活動', label: '活動' },
    { value: '補點', label: '補點' },
    { value: '其他', label: '其他' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLedger(mockLedger);
      setResidents(mockResidents);
    } catch (error) {
      toast.error('載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const todayDeductions = ledger
    .filter(entry => {
      const entryDate = new Date(entry.created_at).toDateString();
      const today = new Date().toDateString();
      return entryDate === today && entry.points < 0;
    })
    .reduce((sum, entry) => sum + entry.points, 0);

  const todayAdditions = ledger
    .filter(entry => {
      const entryDate = new Date(entry.created_at).toDateString();
      const today = new Date().toDateString();
      return entryDate === today && entry.points > 0;
    })
    .reduce((sum, entry) => sum + entry.points, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resident_id || !formData.reason || !formData.points) {
      toast.error('請填寫完整資訊');
      return;
    }

    const points = parseInt(formData.points);
    if (isNaN(points)) {
      toast.error('請輸入有效的點數');
      return;
    }

    try {
      const selectedResident = residents.find(r => r.id === formData.resident_id);
      const newEntry: PointLedger = {
        id: Date.now().toString(),
        resident_id: formData.resident_id,
        resident_name: selectedResident?.name || '',
        item_name: formData.reason,
        points,
        notes: formData.notes,
        created_at: new Date().toISOString(),
        company_id: 'demo-company',
      };
      
      setLedger([newEntry, ...ledger]);
      setDialogOpen(false);
      setFormData({ resident_id: '', reason: '', points: '', notes: '' });
      toast.success('點數調整已記錄');
      onDataChange();
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>點數帳本</CardTitle>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>點數帳本</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setFormData({ resident_id: '', reason: '', points: '', notes: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              調整點數
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>點數調整</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="reason">調整原因</Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇原因" />
                  </SelectTrigger>
                  <SelectContent>
                    {adjustmentReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">點數 (正數為增加，負數為扣除)</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  placeholder="請輸入點數"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">備註</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="請輸入備註（選填）"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">
                  確認調整
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center space-x-2 p-4">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">今日總扣點</p>
                <p className="text-lg font-bold text-red-600">{Math.abs(todayDeductions)} 點</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center space-x-2 p-4">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">今日總補點</p>
                <p className="text-lg font-bold text-green-600">{todayAdditions} 點</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>時間</TableHead>
              <TableHead>住戶</TableHead>
              <TableHead>項目</TableHead>
              <TableHead>點數</TableHead>
              <TableHead>備註</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  尚無點數記錄
                </TableCell>
              </TableRow>
            ) : (
              ledger.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.created_at).toLocaleString('zh-TW')}</TableCell>
                  <TableCell>{entry.resident_name}</TableCell>
                  <TableCell>{entry.item_name}</TableCell>
                  <TableCell>
                    <Badge variant={entry.points > 0 ? "default" : "secondary"}>
                      {entry.points > 0 ? '+' : ''}{entry.points} 點
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.notes}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}