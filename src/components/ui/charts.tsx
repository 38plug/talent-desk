import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function Sparkline({
  data,
  color = '#22D3EE',
}: {
  data: number[]
  color?: string
}) {
  const series = data.map((v, i) => ({ i, v }))
  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            filter="url(#sparkGlow)"
          />
          <defs>
            <filter id="sparkGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function NeonAreaChart({
  data,
  aKey = 'income',
  bKey = 'estimated',
}: {
  data: Array<Record<string, string | number>>
  aKey?: string
  bKey?: string
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gViolet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: '#171C2B',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}
          />
          <Area type="monotone" dataKey={aKey} stroke="#22D3EE" fill="url(#gCyan)" strokeWidth={2.5} />
          <Area
            type="monotone"
            dataKey={bKey}
            stroke="#7C3AED"
            fill="url(#gViolet)"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function NeonBarChart({
  data,
  dataKey = 'value',
}: {
  data: Array<Record<string, string | number>>
  dataKey?: string
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: '#171C2B',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}
          />
          <Bar dataKey={dataKey} fill="url(#barGrad)" radius={[8, 8, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const DONUT_COLORS = ['#22D3EE', '#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#F43F5E']

export function NeonDonut({
  data,
}: {
  data: Array<{ name: string; value: number }>
}) {
  return (
    <div className="flex h-56 items-center gap-4">
      <div className="h-full w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={3}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#171C2B',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-1 flex-col gap-2 text-xs">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-ink-muted">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
              />
              {d.name}
            </span>
            <span className="tabular font-medium text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
