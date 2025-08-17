'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingDown, Calendar, MessageSquare } from 'lucide-react';

interface KPICardsProps {
  totalResidents: number;
  todayDeductions: number;
  todayRegistrations: number;
  totalAnnouncements: number;
}

export function KPICards({ totalResidents, todayDeductions, todayRegistrations, totalAnnouncements }: KPICardsProps) {
  const cards = [
    {
      title: '住戶總數',
      value: totalResidents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '今日扣點總數',
      value: Math.abs(todayDeductions),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: '今日登記次數',
      value: todayRegistrations,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '公告數量',
      value: totalAnnouncements,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}