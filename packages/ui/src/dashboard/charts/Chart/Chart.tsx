import React from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { cn } from '../../../utils/cn';

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface ChartProps {
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick';
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexOptions;
  height?: string | number;
  width?: string | number;
  className?: string;
}

const Chart: React.FC<ChartProps> = ({
  type,
  series,
  options = {},
  height = 350,
  width = '100%',
  className,
}) => {
  const defaultOptions: ApexOptions = {
    chart: {
      type,
      toolbar: { show: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
      fontFamily: 'Inter, system-ui, sans-serif',
      animations: {
        enabled: true,
        speed: 300,
        animateGradually: { enabled: true, delay: 120 },
        dynamicAnimation: { enabled: true, speed: 300 },
      },
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },
    colors: [
      'hsl(var(--primary))',
      'hsl(var(--gold-500))',
      'hsl(var(--green-500))',
      'hsl(var(--blue-500))',
      'hsl(var(--purple-500))',
      'hsl(var(--orange-500))',
      'hsl(var(--red-500))',
      'hsl(var(--pink-500))',
    ],
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
      theme: 'light',
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
      radialBar: {
        hollow: { margin: -8, size: '100%' },
        track: {
          margin: -8,
          strokeWidth: '50%',
          background: 'hsl(var(--muted))',
        },
        dataLabels: {
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

  // Deep merge options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    chart: {
      ...defaultOptions.chart,
      ...options.chart,
    },
    plotOptions: {
      ...defaultOptions.plotOptions,
      ...options.plotOptions,
    },
  };

  return (
    <div className={cn('w-full', className)}>
      <ReactApexChart
        type={type}
        series={series}
        options={mergedOptions}
        height={height}
        width={width}
      />
    </div>
  );
};

export { Chart };