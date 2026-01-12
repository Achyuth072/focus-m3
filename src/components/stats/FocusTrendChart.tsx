"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface FocusTrendChartProps {
  data: Array<{
    date: string;
    hours: number;
  }>;
  className?: string;
}

export function FocusTrendChart({ data, className }: FocusTrendChartProps) {
  return (
    <Card className={cn("p-6 border-border/50", className)}>
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="font-serif text-sm font-medium text-foreground/60 italic lowercase">
            focus trend
          </p>
          <p className="font-serif text-[11px] text-foreground/50 italic">
            Focus hours over the last 7 days
          </p>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                stroke="currentColor"
                className="text-foreground/40"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
                style={{ fontFamily: "var(--font-serif)" }}
              />
              <YAxis
                stroke="currentColor"
                className="text-foreground/40"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}h`}
                style={{ fontFamily: "var(--font-serif)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0px",
                  boxShadow: "none",
                  padding: "12px",
                }}
                itemStyle={{
                  fontSize: "13px",
                  fontFamily: "var(--font-serif)",
                  fontWeight: "600",
                  color: "hsl(var(--foreground))",
                  textTransform: "lowercase",
                }}
                labelStyle={{
                  display: "none",
                }}
                cursor={{
                  stroke: "currentColor",
                  className: "text-foreground/10",
                  strokeWidth: 1,
                }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "hsl(var(--background))",
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
