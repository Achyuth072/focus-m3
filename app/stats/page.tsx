'use client';

import { Target, CheckCircle2, Flame, Clock } from 'lucide-react';
import { MetricCard } from '@/components/stats/MetricCard';
import { FocusTrendChart } from '@/components/stats/FocusTrendChart';

export default function StatsPage() {
  // Sample data - replace with real data from your store/API
  const focusTrendData = [
    { date: 'Mon', minutes: 45 },
    { date: 'Tue', minutes: 60 },
    { date: 'Wed', minutes: 30 },
    { date: 'Thu', minutes: 75 },
    { date: 'Fri', minutes: 90 },
    { date: 'Sat', minutes: 50 },
    { date: 'Sun', minutes: 40 },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Statistics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your productivity and progress
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Top Row - Key Metrics */}
          <MetricCard
            title="Total Focus"
            value="12.5h"
            icon={Clock}
            trend={{ value: 15, isPositive: true }}
          />
          <MetricCard
            title="Tasks Completed"
            value="24"
            icon={CheckCircle2}
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard
            title="Current Streak"
            value="7 days"
            icon={Flame}
          />
          <MetricCard
            title="Completion Rate"
            value="85%"
            icon={Target}
            trend={{ value: 3, isPositive: false }}
          />
        </div>

        {/* Middle Row - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FocusTrendChart 
            data={focusTrendData} 
            className="lg:col-span-2"
          />
          
          {/* Recent Achievements */}
          <div className="p-6 border border-border/50 rounded-lg bg-card">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Recent Achievements
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">7-Day Streak</p>
                  <p className="text-xs text-muted-foreground">Completed tasks every day this week</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Focus Master</p>
                  <p className="text-xs text-muted-foreground">Completed 10 focus sessions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                  <Flame className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Early Bird</p>
                  <p className="text-xs text-muted-foreground">Started work before 9 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
