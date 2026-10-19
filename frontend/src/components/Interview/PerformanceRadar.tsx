import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer
} from 'recharts';

interface Props {
    data: {
        subject: string;
        A: number;
        fullMark: number;
    }[];
}

const PerformanceRadar: React.FC<Props> = ({ data }) => {
    return (
        <div className="w-full h-[280px] flex items-center justify-center font-mono">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} 
                    />
                    <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 10]} 
                        tick={false} 
                        axisLine={false} 
                    />
                    <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.35}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PerformanceRadar;
