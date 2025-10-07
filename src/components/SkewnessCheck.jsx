import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';

// Helper to calculate mean, median, mode, and check for all unique values
function getStats(arr) {
    if (!arr.length) return {};
    const sorted = [...arr].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((a, b) => a + b, 0) / n;
    const median = n % 2 === 0
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];
    // Mode
    const freq = {};
    let maxFreq = 0, mode = [];
    sorted.forEach(v => {
        freq[v] = (freq[v] || 0) + 1;
        if (freq[v] > maxFreq) maxFreq = freq[v];
    });
    // Only set mode if at least one value repeats
    const allUnique = maxFreq === 1;
    if (!allUnique) {
        for (const k in freq) {
            if (freq[k] === maxFreq) mode.push(Number(k));
        }
    }
    // Skewness (Pearson's 2nd coefficient)
    const std = Math.sqrt(sorted.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
    const skewness = 3 * (mean - median) / std;
    return { mean, median, mode, skewness, allUnique };
}

const SkewnessCheck = ({ data, headers }) => {
    const numericHeaders = useMemo(() =>
        headers.filter(header =>
            data.every(row => typeof row[header] === 'number' && isFinite(row[header]))
        ), [data, headers]
    );
    const [selectedCol, setSelectedCol] = useState(numericHeaders[0] || '');

    const values = useMemo(() =>
        data.map(row => row[selectedCol]).filter(v => v !== null && v !== undefined), [data, selectedCol]
    );
    const stats = useMemo(() => getStats(values), [values]);

    // Bell curve (normal distribution) fit
    function normalPDF(x, mean, std) {
        return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
    }
    const n = values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const std = Math.sqrt(values.reduce((a, b) => a + (b - stats.mean) ** 2, 0) / n) || 1;
    const bellX = Array.from({ length: 100 }, (_, i) => min + (max - min) * i / 99);
    const bellY = bellX.map(x => normalPDF(x, stats.mean, std));

    // For histogram
    const histBins = Math.max(10, Math.floor(Math.sqrt(n)));

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Skewness Check</h3>
            <div className="mb-6 max-w-sm">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select a Column
                </label>
                <select
                    value={selectedCol}
                    onChange={e => setSelectedCol(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                >
                    {numericHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                    ))}
                </select>
            </div>
            <motion.div
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Plot
                    data={[
                        {
                            x: values,
                            type: 'histogram',
                            name: 'Data',
                            marker: { color: '#3b82f6', opacity: 0.5 },
                            opacity: 0.5,
                            nbinsx: histBins,
                            hoverinfo: 'x+y'
                        },
                        {
                            x: bellX,
                            y: bellY.map(y => y * n * (max - min) / histBins), // scale bell to histogram
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Normal Curve',
                            line: { color: '#f59e0b', width: 3, dash: 'solid' }
                        },
                        {
                            x: [stats.mean],
                            y: [Math.max(...bellY) * n * (max - min) / histBins * 1.1],
                            type: 'scatter',
                            mode: 'markers+text',
                            name: 'Mean',
                            marker: { color: '#22c55e', size: 14, symbol: 'circle' },
                            text: ['Mean'],
                            textposition: 'top center',
                            showlegend: false
                        },
                        {
                            x: [stats.median],
                            y: [Math.max(...bellY) * n * (max - min) / histBins * 1.05],
                            type: 'scatter',
                            mode: 'markers+text',
                            name: 'Median',
                            marker: { color: '#ef4444', size: 14, symbol: 'diamond' },
                            text: ['Median'],
                            textposition: 'top center',
                            showlegend: false
                        },
                        // Only plot mode if not all unique and mode exists
                        ...((stats.mode && stats.mode.length > 0 && !stats.allUnique) ? [{
                            x: stats.mode,
                            y: stats.mode.map(() => Math.max(...bellY) * n * (max - min) / histBins * 1.15),
                            type: 'scatter',
                            mode: 'markers+text',
                            name: 'Mode',
                            marker: { color: '#6366f1', size: 14, symbol: 'star' },
                            text: stats.mode.map(() => 'Mode'),
                            textposition: 'top center',
                            showlegend: false
                        }] : [])
                    ]}
                    layout={{
                        title: `Distribution & Skewness of "${selectedCol}"`,
                        barmode: 'overlay',
                        autosize: true,
                        font: { family: 'Inter, sans-serif' },
                        xaxis: { title: selectedCol },
                        yaxis: { title: 'Frequency' },
                        legend: { orientation: 'h', y: -0.2 },
                        margin: { t: 40, l: 40, r: 20, b: 40 }
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '400px' }}
                    config={{ responsive: true, displayModeBar: false }}
                />
                <div className="mt-4 flex flex-wrap gap-6">
                    <div className="bg-gray-50 rounded-lg p-4 border min-w-[180px]">
                        <div className="font-bold text-blue-600">Mean</div>
                        <div className="font-mono">{stats.mean?.toFixed(3)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border min-w-[180px]">
                        <div className="font-bold text-red-500">Median</div>
                        <div className="font-mono">{stats.median?.toFixed(3)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border min-w-[180px]">
                        <div className="font-bold text-indigo-600">Mode</div>
                        <div className="font-mono">
                            {(stats.mode && stats.mode.length > 0 && !stats.allUnique)
                                ? stats.mode.join(', ')
                                : <span className="text-gray-400">N/A (all unique)</span>
                            }
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border min-w-[180px]">
                        <div className="font-bold text-yellow-600">Skewness</div>
                        <div className="font-mono">{stats.skewness?.toFixed(3)}</div>
                        <div className="text-xs mt-1 text-gray-500">
                            {stats.skewness > 0.5 ? 'Positively skewed (right)' :
                                stats.skewness < -0.5 ? 'Negatively skewed (left)' :
                                    'Approximately symmetric'}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SkewnessCheck;