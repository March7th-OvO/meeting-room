import React from 'react';
import { Booking, MeetingRoom } from '../../types';
import { BarChart, Users, CalendarCheck, TrendingUp, PieChart, Building } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

interface StatisticsProps {
  bookings: Booking[];
  rooms: MeetingRoom[];
}

export default function Statistics({ bookings, rooms }: StatisticsProps) {
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  
  const roomUsage = rooms.map(room => {
    const usageCount = approvedBookings.filter(b => b.roomId === room.id).length;
    return { name: room.name, value: usageCount };
  }).sort((a, b) => b.value - a.value);

  const stats = [
    { name: '总会议室数', value: rooms.length, borderTop: '#3b82f6' },
    { name: '累计使用次数', value: approvedBookings.length, borderTop: '#10b981' },
    { name: '待处理申请', value: bookings.filter(b => b.status === 'pending').length, borderTop: '#f59e0b' },
  ];

  const barChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: { type: 'value', boundaryGap: [0, 0.01] },
    yAxis: { type: 'category', data: [...roomUsage].reverse().map(item => item.name) },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: [...roomUsage].reverse().map(item => item.value),
        itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] }
      }
    ]
  };

  const pieChartOption = {
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [
      {
        name: '状态分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: [
          { value: bookings.filter(b => b.status === 'approved').length, name: '已批准', itemStyle: { color: '#10b981' } },
          { value: bookings.filter(b => b.status === 'pending').length, name: '待审批', itemStyle: { color: '#f59e0b' } },
          { value: bookings.filter(b => b.status === 'rejected').length, name: '已驳回', itemStyle: { color: '#ef4444' } },
          { value: bookings.filter(b => b.status === 'cancelled').length, name: '已取消', itemStyle: { color: '#64748b' } }
        ]
      }
    ]
  };

  const roomStatusCount = {
    free: 0,
    pending: 0,
    occupied: 0
  };

  rooms.forEach(room => {
    if (room.status === 'maintenance') {
      roomStatusCount.occupied++;
    } else {
      const roomBookings = bookings.filter(b => b.roomId === room.id);
      const isOccupied = roomBookings.some(b => b.status === 'approved');
      const isPending = roomBookings.some(b => b.status === 'pending');
      
      if (isOccupied) {
        roomStatusCount.occupied++;
      } else if (isPending) {
        roomStatusCount.pending++;
      } else {
        roomStatusCount.free++;
      }
    }
  });

  const roomStatusPieOption = {
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [
      {
        name: '会议室状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: [
          { value: roomStatusCount.free, name: '空闲会议室', itemStyle: { color: '#10b981' } },
          { value: roomStatusCount.pending, name: '正在预约', itemStyle: { color: '#eab308' } },
          { value: roomStatusCount.occupied, name: '已被占用', itemStyle: { color: '#ef4444' } }
        ]
      }
    ]
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item, index) => {
          return (
            <div 
              key={index} 
              className="bg-white p-5 rounded-lg shadow-sm border-t-4"
              style={{ borderTopColor: item.borderTop }}
            >
              <p className="text-slate-500 text-sm font-medium uppercase">{item.name}</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{item.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-slate-500" />
              会议室使用次数
            </h3>
          </div>
          <div className="p-6">
            <ReactECharts option={barChartOption} style={{ height: '300px', width: '100%' }} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-slate-500" />
              预约状态分布
            </h3>
          </div>
          <div className="p-6">
            <ReactECharts option={pieChartOption} style={{ height: '300px', width: '100%' }} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              <Building className="w-5 h-5 mr-2 text-slate-500" />
              会议室实时状态比例
            </h3>
          </div>
          <div className="p-6">
            <ReactECharts option={roomStatusPieOption} style={{ height: '300px', width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
