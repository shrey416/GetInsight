// src/components/PlottingStudio.jsx
import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';

const PlottingStudio = ({ data, headers }) => {
    const [plotType, setPlotType] = useState('bar');
    const numericHeaders = headers.filter(header =>
        data.every(row => typeof row[header] === 'number')
    );

    const [xCol, setXCol] = useState(headers[0] || '');
    const [yCol, setYCol] = useState(
        numericHeaders[1] || numericHeaders[0] || ''
    );

    const xData = data.map(row => row[xCol]);
    const yData = data.map(row => row[yCol]);

    const plotData = () => {
        const baseTrace = {
            marker: { color: '#3b82f6' },
            line: { color: '#3b82f6' }
        };
        switch (plotType) {
            case 'scatter':
                return [
                    {
                        ...baseTrace,
                        x: xData,
                        y: yData,
                        mode: 'markers',
                        type: 'scatter'
                    }
                ];
            case 'line':
                return [
                    {
                        ...baseTrace,
                        x: xData,
                        y: yData,
                        mode: 'lines+markers',
                        type: 'scatter'
                    }
                ];
            case 'pie':
                return [
                    {
                        labels: xData,
                        values: yData,
                        type: 'pie',
                        marker: {
                            colors: [
                                '#3b82f6',
                                '#ef4444',
                                '#f59e0b',
                                '#22c55e'
                            ]
                        }
                    }
                ];
            case 'box':
                return [
                    {
                        ...baseTrace,
                        y: yData,
                        type: 'box',
                        name: yCol
                    },
                    {
                        ...baseTrace,
                        y: xData,
                        type: 'box',
                        name: xCol
                    }
                ];
            case 'histogram':
                return [
                    {
                        ...baseTrace,
                        x: xData,
                        type: 'histogram'
                    }
                ];
            default: // bar
                return [
                    {
                        ...baseTrace,
                        x: xData,
                        y: yData,
                        type: 'bar'
                    }
                ];
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Plotting Studio</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-6 bg-gray-50 rounded-xl border">
                <ControlSelect
                    label="Plot Type"
                    value={plotType}
                    onChange={e => setPlotType(e.target.value)}
                >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Plot</option>
                    <option value="scatter">Scatter Plot</option>
                    <option value="pie">Pie Chart</option>
                    <option value="box">Box Plot</option>
                    <option value="histogram">Histogram</option>
                </ControlSelect>

                <ControlSelect
                    label="X-Axis / Labels"
                    value={xCol}
                    onChange={e => setXCol(e.target.value)}
                >
                    {headers.map(h => (
                        <option key={h} value={h}>
                            {h}
                        </option>
                    ))}
                </ControlSelect>

                {['bar', 'line', 'scatter', 'pie', 'box'].includes(plotType) && (
                    <ControlSelect
                        label="Y-Axis / Values"
                        value={yCol}
                        onChange={e => setYCol(e.target.value)}
                    >
                        {numericHeaders.map(h => (
                            <option key={h} value={h}>
                                {h}
                            </option>
                        ))}
                    </ControlSelect>
                )}
            </div>

            <motion.div
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                key={plotType + xCol + yCol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Plot
                    data={plotData()}
                    layout={{
                        title:
                            plotType.charAt(0).toUpperCase() +
                            plotType.slice(1) +
                            ' Plot',
                        autosize: true,
                        font: {
                            family: 'Inter, sans-serif'
                        },
                        xaxis: {
                            title: xCol
                        },
                        yaxis: {
                            title: yCol
                        },
                        transition: {
                            duration: 500,
                            easing: 'cubic-in-out'
                        }
                    }}
                    useResizeHandler={true}
                    style={{
                        width: '100%',
                        height: '500px'
                    }}
                    config={{
                        responsive: true
                    }}
                />
            </motion.div>
        </div>
    );
};

const ControlSelect = ({ label, value, onChange, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <select
            value={value}
            onChange={onChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
        >
            {children}
        </select>
    </div>
);

export default PlottingStudio;