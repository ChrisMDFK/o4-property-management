'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthUser, clearAuthUser, mockResidents, mockLedger, mockAnnouncements } from '@/lib/supabase';
import { KPICards } from '@/components/KPICards';
import { ResidentsTable } from '@/components/ResidentsTable';
import { LedgerTable } from '@/components/LedgerTable';
import { FacilityForm } from '@/components/FacilityForm';
import { AnnouncementList } from '@/components/AnnouncementList';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [kpiData, setKpiData] = useState({
    totalResidents: 0,
    todayDeductions: 0,
    todayRegistrations: 0,
    totalAnnouncements: 0,
  });

  useEffect(() => {
    const authUser = getAuthUser();
    if (!authUser) {
      router.push('/login');
      return;
    }
    setUser(authUser);
    loadKPIData();
    setLoading(false);
  }, [router]);

  const loadKPIData = () => {
    // Mock KPI calculations
    const totalResidents = mockResidents.length;
    const todayDeductions = mockLedger
      .filter(entry => {
        const entryDate = new Date(entry.created_at).toDateString();
        const today = new Date().toDateString();
        return entryDate === today && entry.points < 0;
      })
      .reduce((sum, entry) => sum + entry.points, 0);
    
    const todayRegistrations = 2; // Mock data
    const totalAnnouncements = mockAnnouncements.length;

    setKpiData({
      totalResidents,
      todayDeductions,
      todayRegistrations,
      totalAnnouncements,
    });
  };

  const handleLogout = () => {
    clearAuthUser();
    toast.success('已登出');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Home className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">社區管理系統</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.company_id} - 管理員
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <KPICards
          totalResidents={kpiData.totalResidents}
          todayDeductions={kpiData.todayDeductions}
          todayRegistrations={kpiData.todayRegistrations}
          totalAnnouncements={kpiData.totalAnnouncements}
        />

        {/* Main Dashboard */}
        <Tabs defaultValue="residents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="residents">住戶管理</TabsTrigger>
            <TabsTrigger value="ledger">點數帳本</TabsTrigger>
            <TabsTrigger value="facilities">公設登記</TabsTrigger>
            <TabsTrigger value="announcements">公告管理</TabsTrigger>
          </TabsList>

          <TabsContent value="residents">
            <ResidentsTable onDataChange={loadKPIData} />
          </TabsContent>

          <TabsContent value="ledger">
            <LedgerTable onDataChange={loadKPIData} />
          </TabsContent>

          <TabsContent value="facilities">
            <FacilityForm onDataChange={loadKPIData} />
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementList onDataChange={loadKPIData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}