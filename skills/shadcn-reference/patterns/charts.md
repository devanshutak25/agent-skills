# shadcn/ui Chart Patterns

## Setup
```bash
npx shadcn@latest add chart
```
Installs: `recharts`

## ChartConfig
```tsx
import { type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
```

### Color Sources
| Source | Example |
|--------|---------|
| CSS variable | `color: "var(--chart-1)"` |
| HSL value | `color: "hsl(220, 98%, 61%)"` |
| OKLCH value | `color: "oklch(0.646 0.222 41.116)"` |
| Theme variable | `color: "var(--primary)"` |

## ChartContainer
Wraps Recharts `ResponsiveContainer` + applies theme.
```tsx
import { ChartContainer } from "@/components/ui/chart"

<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
  <BarChart data={data}>
    {/* chart elements */}
  </BarChart>
</ChartContainer>
```

## Chart Types

### Bar Chart
```tsx
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  // ...
]

<ChartContainer config={chartConfig}>
  <BarChart data={data}>
    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
```

### Line Chart
```tsx
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

<ChartContainer config={chartConfig}>
  <LineChart data={data} margin={{ left: 12, right: 12 }}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
    <Line dataKey="desktop" type="monotone" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
  </LineChart>
</ChartContainer>
```

### Area Chart
```tsx
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

<ChartContainer config={chartConfig}>
  <AreaChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Area dataKey="desktop" type="natural" fill="var(--color-desktop)" fillOpacity={0.4} stroke="var(--color-desktop)" />
  </AreaChart>
</ChartContainer>
```

### Pie Chart
```tsx
import { Pie, PieChart } from "recharts"

const data = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]

<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
  <PieChart>
    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
    <Pie data={data} dataKey="visitors" nameKey="browser" innerRadius={60} />
  </PieChart>
</ChartContainer>
```

### Radar Chart
```tsx
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
  <RadarChart data={data}>
    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
    <PolarAngleAxis dataKey="month" />
    <PolarGrid />
    <Radar dataKey="desktop" fill="var(--color-desktop)" fillOpacity={0.6} />
  </RadarChart>
</ChartContainer>
```

### Radial Bar Chart
```tsx
import { RadialBar, RadialBarChart } from "recharts"

<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
  <RadialBarChart data={data} innerRadius={30} outerRadius={110}>
    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="browser" />} />
    <RadialBar dataKey="visitors" background />
  </RadialBarChart>
</ChartContainer>
```

## ChartTooltip
```tsx
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Default
<ChartTooltip content={<ChartTooltipContent />} />

// Hide label
<ChartTooltip content={<ChartTooltipContent hideLabel />} />

// Hide indicator
<ChartTooltip content={<ChartTooltipContent hideIndicator />} />

// Custom label key
<ChartTooltip content={<ChartTooltipContent nameKey="browser" />} />

// Indicator styles: "line" | "dot" | "dashed"
<ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
```

## ChartLegend
```tsx
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"

<ChartLegend content={<ChartLegendContent />} />
```

## Chart CSS Variables
Defined in global CSS:
```css
:root {
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}
```
