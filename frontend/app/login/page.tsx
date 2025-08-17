'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { setAuthUser } from '@/lib/supabase';

export default function LoginPage() {
  const [companyId, setCompanyId] = useState('');
  const [jwt, setJwt] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId || !jwt) {
      toast.error('請填寫完整的登入資訊');
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, you would validate the JWT here
      // For demo purposes, we'll accept any input
      setAuthUser({
        company_id: companyId,
        role: 'manager',
        jwt: jwt,
      });
      
      toast.success('登入成功');
      router.push('/dashboard');
    } catch (error) {
      toast.error('登入失敗，請檢查您的資訊');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">社區管理系統</CardTitle>
          <CardDescription>請輸入您的登入資訊</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyId">公司代碼</Label>
              <Input
                id="companyId"
                type="text"
                placeholder="請輸入公司代碼"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jwt">授權憑證</Label>
              <Input
                id="jwt"
                type="password"
                placeholder="請輸入JWT授權憑證"
                value={jwt}
                onChange={(e) => setJwt(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登入中...' : '登入'}
            </Button>
          </form>
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
            <p className="font-medium">測試用帳號:</p>
            <p>公司代碼: demo-company</p>
            <p>JWT: demo-jwt-token</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}