import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { BurnUpChartItem } from '@/types';
import dayjs from 'dayjs';
import { RiLineChartLine } from 'react-icons/ri';

interface BurnUpChartProps {
    data: BurnUpChartItem[];
}

export const BurnUpChart: React.FC<BurnUpChartProps> = ({ data }) => {
    const formattedData = data?.map(item => ({
        ...item,
        formattedDate: dayjs(item.date).format('DD/MM/YYYY'),
    })) || [];

    return (
        <div className="w-full h-[400px] bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Burn Up Grafiği</h3>
            {(!data || data.length === 0) ? (
                <div className="w-full h-[340px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded border border-slate-100 border-dashed">
                    <RiLineChartLine className="w-12 h-12 mb-3 opacity-50" />
                    <span>Görüntülenecek veri bulunamadı</span>
                </div>
            ) : (
                <div className="w-full h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={formattedData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="formattedDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line
                                type="monotone"
                                dataKey="totalScope"
                                name="Toplam Kapsam"
                                stroke="#94a3b8"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#94a3b8' }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="completedWork"
                                name="Tamamlanan İş"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#3b82f6' }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="idealTrend"
                                name="İdeal Trend"
                                stroke="#22c55e"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};
