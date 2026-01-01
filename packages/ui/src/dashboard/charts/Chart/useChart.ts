import { ApexOptions } from 'apexcharts';

export interface UseChartOptions extends Omit<Partial<ApexOptions>, 'theme'> {
  theme?: 'light' | 'dark';
  colorScheme?: 'default' | 'gold' | 'blue' | 'green' | 'purple';
}

export function useChart(options: UseChartOptions = {}): ApexOptions {
  const { theme = 'light', colorScheme = 'default', ...chartOptions } = options;

  const colorSchemes = {
    default: [
      'hsl(var(--primary))',
      'hsl(var(--gold-500))',
      'hsl(var(--green-500))',
      'hsl(var(--blue-500))',
      'hsl(var(--purple-500))',
    ],
    gold: [
      'hsl(var(--gold-500))',
      'hsl(var(--gold-400))',
      'hsl(var(--gold-600))',
      'hsl(var(--gold-300))',
      'hsl(var(--gold-700))',
    ],
    blue: [
      'hsl(var(--blue-500))',
      'hsl(var(--blue-400))',
      'hsl(var(--blue-600))',
      'hsl(var(--blue-300))',
      'hsl(var(--blue-700))',
    ],
    green: [
      'hsl(var(--green-500))',
      'hsl(var(--green-400))',
      'hsl(var(--green-600))',
      'hsl(var(--green-300))',
      'hsl(var(--green-700))',
    ],
    purple: [
      'hsl(var(--purple-500))',
      'hsl(var(--purple-400))',
      'hsl(var(--purple-600))',
      'hsl(var(--purple-300))',
      'hsl(var(--purple-700))',
    ],
  };

  const baseOptions: ApexOptions = {
    colors: colorSchemes[colorScheme],
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
      fontFamily: 'Inter, system-ui, sans-serif',
      foreColor: theme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))',
      animations: {
        enabled: true,
        speed: 300,
        animateGradually: { enabled: true, delay: 120 },
        dynamicAnimation: { enabled: true, speed: 300 },
      },
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2.5,
      curve: 'smooth',
      lineCap: 'round',
    },
    grid: {
      strokeDashArray: 3,
      borderColor: 'hsl(var(--border))',
      padding: { top: 0, right: 0, bottom: 0 },
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: 'hsl(var(--muted-foreground))',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      tickAmount: 5,
      labels: {
        style: {
          colors: 'hsl(var(--muted-foreground))',
          fontSize: '12px',
        },
      },
    },
    tooltip: {
      theme: theme,
      fillSeriesColor: false,
      x: { show: true },
    },
    legend: {
      show: false,
      fontSize: '14px',
      position: 'top',
      horizontalAlign: 'right',
      markers: { shape: 'circle' },
      fontWeight: 500,
      itemMargin: { horizontal: 8, vertical: 8 },
      labels: { colors: 'hsl(var(--foreground))' },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '48%',
        borderRadiusApplication: 'end',
      },
      pie: {
        donut: {
          labels: {
            show: true,
            value: {
              offsetY: 8,
              color: 'hsl(var(--foreground))',
              fontSize: '14px',
            },
            total: {
              show: true,
              label: 'Total',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '14px',
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          plotOptions: {
            bar: { columnWidth: '80%', borderRadius: 3 },
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: { columnWidth: '62%' },
          },
        },
      },
    ],
  };

  // Deep merge the options
  return deepMerge(baseOptions, chartOptions);
}

// Simple deep merge utility
function deepMerge(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}