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
    <div className="h-7 w-16 shrink-0 overflow-hidden sm:h-12 sm:w-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
          <defs>
            <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.25}
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

const axisTick = { fill: '#cbd5e1', fontSize: 12, fontWeight: 500 as const }

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
    <div className="h-48 w-full min-w-0 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
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
            fontSize={12}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            dy={6}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#cbd5e1"
            fontSize={12}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={36}
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
    <div className="h-48 w-full min-w-0 sm:h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
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
            fontSize={12}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            dy={6}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#cbd5e1"
            fontSize={12}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={36}
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
    <div className="flex min-h-0 flex-col items-stretch gap-3 sm:h-56 sm:flex-row sm:items-center sm:gap-4">
      <div className="mx-auto h-40 w-full max-w-[11rem] sm:mx-0 sm:h-full sm:w-1/2 sm:max-w-none">
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
      <ul className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2 text-sm sm:flex sm:flex-col sm:gap-2.5 sm:text-[15px]">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2 text-ink-muted sm:gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3"
                style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
              />
              <span className="truncate">{d.name}</span>
            </span>
            <span className="tabular shrink-0 font-semibold text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
