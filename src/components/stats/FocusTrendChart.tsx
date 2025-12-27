'use client';

import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface FocusTrendChartProps {
  data: Array<{
    date: string;
    minutes: number;
  }>;
  className?: string;
}

export function FocusTrendChart({ data, className }: FocusTrendChartProps) {
  return (
    <Card className={cn('p-6 border-border/50', className)}>
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Focus Trend
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Last 7 days
          </p>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line 
              type="monotone" 
              dataKey="minutes" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
