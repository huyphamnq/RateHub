'use client'

import type { SentimentData } from '@/lib/types'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'

type SentimentChartProps = {
  data: SentimentData[];
}

export default function SentimentChart({ data }: SentimentChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
            }}
        />
        <Legend />
        <Bar dataKey="positive" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="neutral" fill="#facc15" radius={[4, 4, 0, 0]} />
        <Bar dataKey="negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
