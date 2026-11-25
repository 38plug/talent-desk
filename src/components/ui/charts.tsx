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
  const filterId = `sparkGlow-${color.replace('#', '')}`
  return (
    <div className="h-12 w-28 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series}>
          <defs>
            <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.75}
            dot={false}
            filter={`url(#${filterId})`}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          />
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
              <stop offset="0%" stopColor="#C6F432" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#C6F432" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gViolet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F4B183" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#F4B183" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#cbd5e1"
            fontSize={14}
            tick={{ fill: '#cbd5e1', fontSize: 14, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            stroke="#cbd5e1"
            fontSize={14}
            tick={{ fill: '#cbd5e1', fontSize: 14, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              fontSize: 14,
            }}
          />
          <Area
            type="monotone"
            dataKey={aKey}
            stroke="#C6F432"
            fill="url(#gCyan)"
            strokeWidth={3}
            isAnimationActive
            animationDuration={1100}
            animationEasing="ease-out"
            style={{ filter: 'drop-shadow(0 0 6px rgba(198,244,50,0.65))' }}
          />
          <Area
            type="monotone"
            dataKey={bKey}
            stroke="#F4B183"
            fill="url(#gViolet)"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            isAnimationActive
            animationDuration={1300}
            animationEasing="ease-out"
            style={{ filter: 'drop-shadow(0 0 6px rgba(244,177,131,0.55))' }}
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
              <stop offset="0%" stopColor="#C6F432" />
              <stop offset="100%" stopColor="#F4B183" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#cbd5e1"
            fontSize={14}
            tick={{ fill: '#cbd5e1', fontSize: 14, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            stroke="#cbd5e1"
            fontSize={14}
            tick={{ fill: '#cbd5e1', fontSize: 14, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              fontSize: 14,
            }}
          />
          <Bar
            dataKey={dataKey}
            fill="url(#barGrad)"
            radius={[8, 8, 4, 4]}
            isAnimationActive
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const DONUT_COLORS = ['#C6F432', '#F4B183', '#7C3AED', '#10B981', '#F59E0B', '#F43F5E']

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
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-out"
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
      <ul className="flex flex-1 flex-col gap-2.5 text-[15px]">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2.5 text-ink-muted">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
              />
              {d.name}
            </span>
            <span className="tabular font-semibold text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
