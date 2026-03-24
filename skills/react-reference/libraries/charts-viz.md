# Charts & Data Visualization

## Decision Matrix

| Library | Bundle | Approach | Best For |
|---------|--------|----------|----------|
| **Recharts** | ~40 kB | Declarative React + D3 | Simple charts, quick setup |
| **Nivo** | ~varies per chart | D3-based, SVG/Canvas/HTML | Many chart types, rich theming |
| **Tremor** | ~varies | Recharts + Tailwind wrapper | Dashboard metrics, SaaS |
| **D3.js** | ~80 kB (full) | Low-level imperative | Custom, complex visualizations |
| **visx** | ~tree-shakeable | D3 primitives as React | Full D3 power, React-friendly |

---

## Recharts (Most Popular)

```bash
npm install recharts
```

### Line Chart
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 4000, users: 2400 },
  { month: 'Feb', revenue: 3000, users: 1398 },
  { month: 'Mar', revenue: 2000, users: 9800 },
];

function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
        <Line type="monotone" dataKey="users" stroke="#6b7280" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Bar Chart
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### Pie Chart
```tsx
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'];

<PieChart width={300} height={300}>
  <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
  </Pie>
  <Tooltip />
</PieChart>
```

---

## Tremor (Dashboard-Focused)

```bash
npm install @tremor/react
```

```tsx
import { Card, Metric, Text, AreaChart, BarList, DonutChart } from '@tremor/react';

function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* KPI Card */}
      <Card>
        <Text>Revenue</Text>
        <Metric>$45,231</Metric>
      </Card>

      {/* Area Chart */}
      <Card>
        <AreaChart
          data={chartData}
          index="date"
          categories={['Revenue', 'Profit']}
          colors={['blue', 'emerald']}
          valueFormatter={(v) => `$${v.toLocaleString()}`}
        />
      </Card>

      {/* Bar List */}
      <Card>
        <BarList
          data={[
            { name: 'USA', value: 456 },
            { name: 'UK', value: 351 },
            { name: 'Germany', value: 271 },
          ]}
        />
      </Card>
    </div>
  );
}
```

**Pick Tremor when:** Building SaaS dashboards with Tailwind. High-level API, minimal config.

---

## Nivo

```bash
npm install @nivo/core @nivo/line @nivo/bar @nivo/pie
```

```tsx
import { ResponsiveLine } from '@nivo/line';

const data = [{
  id: 'revenue',
  data: [
    { x: 'Jan', y: 100 },
    { x: 'Feb', y: 120 },
    { x: 'Mar', y: 160 },
  ],
}];

function NivoLineChart() {
  return (
    <div style={{ height: 400 }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
        axisBottom={{ legend: 'Month' }}
        axisLeft={{ legend: 'Revenue' }}
        pointSize={10}
        useMesh
        enableSlices="x"
      />
    </div>
  );
}
```

**Pick Nivo when:** Need variety (30+ chart types), built-in theming, SVG/Canvas/HTML rendering options.

---

## visx (Airbnb)

```bash
npm install @visx/group @visx/scale @visx/shape @visx/axis
```

```tsx
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';

function VisxBarChart({ data, width, height }: { data: Datum[]; width: number; height: number }) {
  const xScale = scaleBand({
    domain: data.map(d => d.label),
    range: [0, width],
    padding: 0.4,
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => d.value))],
    range: [height, 0],
  });

  return (
    <svg width={width} height={height}>
      <Group>
        {data.map((d) => (
          <Bar
            key={d.label}
            x={xScale(d.label)}
            y={yScale(d.value)}
            width={xScale.bandwidth()}
            height={height - yScale(d.value)}
            fill="#3b82f6"
          />
        ))}
      </Group>
    </svg>
  );
}
```

**Pick visx when:** Need full D3 control with React component ergonomics. Tree-shakeable. Good for custom visualizations.

---

## Choosing Guide

```
Quick dashboard charts?           → Recharts or Tremor
SaaS metrics with Tailwind?       → Tremor
Many chart types, theming?        → Nivo
Full custom viz, D3 power?        → visx or D3
Simplest API?                     → Recharts
```
