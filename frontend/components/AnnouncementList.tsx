'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Announcement, mockAnnouncements } from '@/lib/supabase';

interface AnnouncementListProps {
  onDataChange: () => void;
}

export function AnnouncementList({ onDataChange }: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_published: false,
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnnouncements(mockAnnouncements);
    } catch (error) {
      toast.error('載入公告失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('請填寫標題和內容');
      return;
    }

    try {
      if (editingAnnouncement) {
        // Update existing announcement
        const updatedAnnouncements = announcements.map(a => 
          a.id === editingAnnouncement.id 
            ? { ...a, ...formData }
            : a
        );
        setAnnouncements(updatedAnnouncements);
        toast.success('公告已更新');
      } else {
        // Create new announcement
        const newAnnouncement: Announcement = {
          id: Date.now().toString(),
          ...formData,
          company_id: 'demo-company',
          created_at: new Date().toISOString(),
        };
        setAnnouncements([newAnnouncement, ...announcements]);
        toast.success('公告已新增');
      }
      
      setDialogOpen(false);
      setEditingAnnouncement(null);
      setFormData({ title: '', content: '', is_published: false });
      onDataChange();
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      is_published: announcement.is_published,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此公告嗎？')) return;
    
    try {
      setAnnouncements(announcements.filter(a => a.id !== id));
      toast.success('公告已刪除');
      onDataChange();
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  const handlePreview = (announcement: Announcement) => {
    setPreviewAnnouncement(announcement);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>公告管理</CardTitle>
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
        <CardTitle>公告管理</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAnnouncement(null);
              setFormData({ title: '', content: '', is_published: false });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              新增公告
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? '編輯公告' : '新增公告'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">標題</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="請輸入公告標題"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">內容</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="請輸入公告內容"
                  rows={6}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="is_published">立即發布</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">
                  {editingAnnouncement ? '更新' : '新增'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>標題</TableHead>
              <TableHead>發布時間</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  尚無公告
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {announcement.title}
                  </TableCell>
                  <TableCell>{new Date(announcement.created_at).toLocaleString('zh-TW')}</TableCell>
                  <TableCell>
                    <Badge variant={announcement.is_published ? "default" : "secondary"}>
                      {announcement.is_published ? '已發布' : '草稿'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(announcement)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(announcement.id)}
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

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>公告預覽</DialogTitle>
          </DialogHeader>
          {previewAnnouncement && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{previewAnnouncement.title}</h3>
                <p className="text-sm text-gray-500">
                  發布時間: {new Date(previewAnnouncement.created_at).toLocaleString('zh-TW')}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="whitespace-pre-wrap">{previewAnnouncement.content}</p>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  關閉
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}