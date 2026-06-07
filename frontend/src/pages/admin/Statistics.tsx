import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { StatisticsBundle } from '../../types';
import { getCurrentRoomUsageLabel, getRoomStatusLabel } from '../../lib/labels';

interface StatisticsProps {
  statistics: StatisticsBundle | null;
}

export default function Statistics({ statistics }: StatisticsProps) {
  const [currentUsageHover, setCurrentUsageHover] = useState<string | null>(null);
  if (!statistics) {
    return <div className="text-slate-500">管理员会话准备完成后将加载统计数据。</div>;
  }

  const roomStatusColors: Record<string, string> = {
    available: '#16a34a',
    maintenance: '#dc2626',
  };
  const currentUsageColors: Record<string, string> = {
    in_use: '#EE0000',
    under_review: '#FFD700',
    idle: '#39C5BB',
  };

  const overviewCards = [
    { name: '会议室数', value: statistics.overview.roomCount, color: '#0f172a' },
    { name: '已通过', value: statistics.overview.approvedBookingCount, color: '#059669' },
    { name: '待审批', value: statistics.overview.pendingBookingCount, color: '#d97706' },
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
        itemStyle: { color: '#66CCFF', borderRadius: [0, 6, 6, 0] },
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
          name: getRoomStatusLabel(item.name as 'available' | 'maintenance'),
          itemStyle: {
            color: roomStatusColors[item.name] ?? '#64748b',
          },
        })),
      },
    ],
  };

  const currentUsageData = useMemo(
    () =>
      statistics.currentRoomUsage.map((item) => ({
        value: item.value,
        name: getCurrentRoomUsageLabel(item.name),
        itemStyle: {
          color: currentUsageColors[item.name] ?? '#64748b',
          borderRadius: 14,
          borderColor: '#ffffff',
          borderWidth: 6,
        },
      })),
    [statistics.currentRoomUsage],
  );

  const currentUsageOption = {
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        padAngle: 4,
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderRadius: 14,
          borderColor: '#ffffff',
          borderWidth: 6,
        },
        emphasis: {
          scale: false,
        },
        data: currentUsageData,
      },
    ],
  };

  const currentUsageEvents = useMemo(
    () => ({
      mouseover: (params: { componentType?: string; name?: string }) => {
        if (params.componentType === 'series' && params.name) {
          setCurrentUsageHover(params.name);
        }
      },
      mouseout: (params: { componentType?: string }) => {
        if (params.componentType === 'series') {
          setCurrentUsageHover(null);
        }
      },
      globalout: () => {
        setCurrentUsageHover(null);
      },
    }),
    [],
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">统计</h2>
        <p className="text-slate-500 mt-1">所有指标均来自后端聚合接口。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {overviewCards.map((item) => (
          <div key={item.name} className="bg-white p-5 rounded-2xl shadow-sm border-t-4" style={{ borderTopColor: item.color }}>
            <p className="text-slate-500 text-sm font-medium uppercase">{item.name}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">会议室使用top5</h3>
          </div>
          <div className="p-6">
            <ReactECharts option={roomUsageOption} style={{ height: '340px', width: '100%' }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">会议室状态</h3>
          </div>
          <div className="p-6">
            <ReactECharts option={statusOption} style={{ height: '340px', width: '100%' }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">会议室当前使用状态</h3>
          </div>
          <div className="p-6">
            <div className="relative">
              <ReactECharts
                option={currentUsageOption}
                onEvents={currentUsageEvents}
                style={{ height: '340px', width: '100%' }}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white text-center">
                  <span className="max-w-20 text-lg font-semibold leading-6 text-slate-800">
                    {currentUsageHover ?? '当前状态'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
