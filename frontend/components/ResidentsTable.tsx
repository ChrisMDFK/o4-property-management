'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Resident, mockResidents } from '@/lib/supabase';

interface ResidentsTableProps {
  onDataChange: () => void;
}

export function ResidentsTable({ onDataChange }: ResidentsTableProps) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    setLoading(true);
    try {
      // In a real app, this would be a Supabase query
      // const { data, error } = await supabase.from('residents').select('*').eq('company_id', companyId);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      setResidents(mockResidents);
    } catch (error) {
      toast.error('載入住戶資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = residents.filter(resident =>
    resident.name.includes(searchTerm) ||
    resident.address.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingResident) {
        // Update existing resident
        const updatedResidents = residents.map(r => 
          r.id === editingResident.id 
            ? { ...r, ...formData }
            : r
        );
        setResidents(updatedResidents);
        toast.success('住戶資料已更新');
      } else {
        // Create new resident
        const newResident: Resident = {
          id: Date.now().toString(),
          ...formData,
          company_id: 'demo-company',
          created_at: new Date().toISOString(),
          balance: 0,
        };
        setResidents([...residents, newResident]);
        toast.success('住戶已新增');
      }
      
      setDialogOpen(false);
      setEditingResident(null);
      setFormData({ name: '', address: '', phone: '', email: '', notes: '' });
      onDataChange();
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  const handleEdit = (resident: Resident) => {
    setEditingResident(resident);
    setFormData({
      name: resident.name,
      address: resident.address,
      phone: resident.phone,
      email: resident.email || '',
      notes: resident.notes || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此住戶嗎？')) return;
    
    try {
      setResidents(residents.filter(r => r.id !== id));
      toast.success('住戶已刪除');
      onDataChange();
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>住戶管理</CardTitle>
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
        <CardTitle>住戶管理</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingResident(null);
              setFormData({ name: '', address: '', phone: '', email: '', notes: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              新增住戶
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingResident ? '編輯住戶' : '新增住戶'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="請輸入姓名"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">門牌</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="請輸入門牌"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="請輸入電話"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="請輸入Email（選填）"
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
                  {editingResident ? '更新' : '新增'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="搜尋姓名或門牌..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>門牌</TableHead>
              <TableHead>電話</TableHead>
              <TableHead>點數餘額</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  {searchTerm ? '未找到符合條件的住戶' : '尚無住戶資料'}
                </TableCell>
              </TableRow>
            ) : (
              filteredResidents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="font-medium">{resident.name}</TableCell>
                  <TableCell>{resident.address}</TableCell>
                  <TableCell>{resident.phone}</TableCell>
                  <TableCell>
                    <Badge variant={resident.balance && resident.balance > 0 ? "default" : "secondary"}>
                      {resident.balance || 0} 點
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(resident)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(resident.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}