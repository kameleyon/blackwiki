import { ChartData, ChartOptions } from 'chart.js';

declare module 'react-chartjs-2' {
  import { FC } from 'react';

  interface ChartProps {
    data: ChartData;
    options?: ChartOptions;
    height?: number;
    width?: number;
  }

  export const Line: FC<ChartProps>;
  export const Bar: FC<ChartProps>;
  export const Doughnut: FC<ChartProps>;
  export const Pie: FC<ChartProps>;
  export const Radar: FC<ChartProps>;
}
