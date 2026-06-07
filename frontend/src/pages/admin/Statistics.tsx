import ReactECharts from 'echarts-for-react';
import { StatisticsBundle } from '../../types';

interface StatisticsProps {
  statistics: StatisticsBundle | null;
}

export default function Statistics({ statistics }: StatisticsProps) {
  if (!statistics) {
    return <div className="text-slate-500">Statistics will load after the admin session is ready.</div>;
  }

  const roomStatusColors: Record<string, string> = {
    available: '#16a34a',
    maintenance: '#dc2626',
  };

  const overviewCards = [
    { name: 'Rooms', value: statistics.overview.roomCount, color: '#0f172a' },
    { name: 'Approved', value: statistics.overview.approvedBookingCount, color: '#059669' },
    { name: 'Pending', value: statistics.overview.pendingBookingCount, color: '#d97706' },
  ];

  const roomUsageOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: [...statistics.roomUsage].reverse().map((item) => item.name) },
    series: [
      {
        type: 'bar',
        data: [...statistics.roomUsage].reverse().map((item) => item.value),
        itemStyle: { color: '#0f172a', borderRadius: [0, 6, 6, 0] },
      },
    ],
  };

  const statusOption = {
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        labelLine: { show: false },
        data: statistics.roomStatus.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: roomStatusColors[item.name] ?? '#64748b',
          },
        })),
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Statistics</h2>
        <p className="text-slate-500 mt-1">All metrics are coming from backend aggregation endpoints.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {overviewCards.map((item) => (
          <div key={item.name} className="bg-white p-5 rounded-2xl shadow-sm border-t-4" style={{ borderTopColor: item.color }}>
            <p className="text-slate-500 text-sm font-medium uppercase">{item.name}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Room Usage</h3>
          </div>
          <div className="p-6">
            <ReactECharts option={roomUsageOption} style={{ height: '340px', width: '100%' }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Room Status</h3>
          </div>
          <div className="p-6">
            <ReactECharts option={statusOption} style={{ height: '340px', width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
