// src/components/DataAnalytics.jsx
import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    memo
} from 'react';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import anime from 'animejs';
import Modal from './Modal';

// Helper component for animated numbers
const AnimatedNumber = memo(({ value }) => {
    const spanRef = useRef(null);

    useEffect(() => {
        const obj = { val: 0 };
        anime({
            targets: obj,
            val: value,
            round: 100,
            easing: 'easeOutExpo',
            duration: 1200,
            update: () => {
                if (spanRef.current) {
                    spanRef.current.innerHTML = Number(obj.val).toLocaleString();
                }
            },
        });
    }, [value]);

    return <span ref={spanRef} />;
});

const calculateAllMetrics = (colData) => {
    if (!colData || colData.length === 0) return null;

    const sorted = [...colData].sort((a, b) => a - b);
    const n = sorted.length;

    // 5-Number Summary
    const min = sorted[0];
    const max = sorted[n - 1];
    const q1 = sorted[Math.floor(n / 4)];
    const median = sorted[Math.floor(n / 2)];
    const q3 = sorted[Math.floor((n * 3) / 4)];
    const iqr = q3 - q1;

    // Other metrics
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;
    const stdDev = Math.sqrt(sorted.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);

    // Optimized Mode
    const frequency = new Map();
    let maxFreq = 0;
    for (const val of sorted) {
        const count = (frequency.get(val) || 0) + 1;
        frequency.set(val, count);
        if (count > maxFreq) {
            maxFreq = count;
        }
    }
    const modes = [];
    if (maxFreq > 1) { // Only consider modes if they appear more than once
        for (const [val, count] of frequency.entries()) {
            if (count === maxFreq) {
                modes.push(val);
            }
        }
    }

    // Outliers
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = sorted.filter(v => v < lowerBound || v > upperBound);

    return {
        min,
        q1,
        median,
        q3,
        max,
        iqr,
        mean,
        stdDev,
        modes,
        outliers,
        count: n
    };
};

const DataAnalytics = ({ data, headers }) => {
    const numericHeaders = useMemo(() => headers.filter(header =>
        data.every(row => typeof row[header] === 'number' && isFinite(row[header]))
    ), [data, headers]);

    const [selectedColumn, setSelectedColumn] = useState(numericHeaders[0] || null);
    const [summary, setSummary] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (selectedColumn) {
            const columnData = data.map(row => row[selectedColumn]).filter(v => v !== null && v !== undefined);
            setSummary(calculateAllMetrics(columnData));
        }
    }, [selectedColumn, data]);

    if (!selectedColumn) {
        return (
            <div className="text-center text-gray-500">
                No numeric columns available for analysis.
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Column Analytics</h3>

            <div className="mb-8 max-w-sm">
                <label htmlFor="column-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Select a Column
                </label>
                <select
                    id="column-select"
                    onChange={e => setSelectedColumn(e.target.value)}
                    value={selectedColumn}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                >
                    {numericHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                    ))}
                </select>
            </div>

            {summary && (
                <motion.div
                    key={selectedColumn}
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* 2x2 Grid Layout */}
                    <MetricCard title="Five-Number Summary">
                        <p>Min: <span className="font-mono text-blue-600"><AnimatedNumber value={summary.min} /></span></p>
                        <p>Q1: <span className="font-mono text-blue-600"><AnimatedNumber value={summary.q1} /></span></p>
                        <p>Median: <span className="font-mono text-blue-600"><AnimatedNumber value={summary.median} /></span></p>
                        <p>Q3: <span className="font-mono text-blue-600"><AnimatedNumber value={summary.q3} /></span></p>
                        <p>Max: <span className="font-mono text-blue-600"><AnimatedNumber value={summary.max} /></span></p>
                    </MetricCard>

                    <motion.div
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm min-h-[300px]"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                    >
                        <h4 className="font-bold text-gray-800 mb-2">Box Plot</h4>
                        <Plot
                            data={[
                                {
                                    y: data.map(r => r[selectedColumn]),
                                    type: 'box',
                                    name: selectedColumn,
                                    marker: { color: '#3b82f6' }
                                }
                            ]}
                            layout={{
                                autosize: true,
                                margin: { t: 20, b: 20, l: 40, r: 20 },
                                yaxis: { title: selectedColumn },
                            }}
                            useResizeHandler={true}
                            style={{ width: '100%', height: '100%' }}
                            config={{ displayModeBar: false }}
                        />
                    </motion.div>

                    <MetricCard title="Statistical Metrics">
                        <p>Mean: <span className="font-mono text-green-600"><AnimatedNumber value={summary.mean} /></span></p>
                        <p>Median: <span className="font-mono text-green-600"><AnimatedNumber value={summary.median} /></span></p>
                        <p>Std.Dev: <span className="font-mono text-green-600"><AnimatedNumber value={summary.stdDev} /></span></p>
                        <ModeMetric
                            title="Mode(s)"
                            modes={summary.modes}
                            onViewAll={() => setIsModalOpen(true)}
                        />
                    </MetricCard>

                    <MetricCard title="Outlier Analysis">
                        <p className="text-5xl font-bold text-red-500">
                            <AnimatedNumber value={summary.outliers.length} />
                        </p>
                        <p className="text-gray-500">outliers detected</p>
                        <p className="text-sm mt-4">
                            (Values outside <code>Q1 - 1.5 * IQR</code> or <code>Q3 + 1.5 * IQR</code>)
                        </p>
                    </MetricCard>
                </motion.div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`All Mode Values for ${selectedColumn}`}
            >
                <ul className="space-y-1 list-disc list-inside">
                    {summary && summary.modes.map((mode, index) => (
                        <li key={index}>{mode}</li>
                    ))}
                </ul>
            </Modal>
        </div>
    );
};

const MetricCard = memo(({ title, children }) => (
    <motion.div
        className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm min-h-[300px]"
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}
        whileHover={{
            scale: 1.03,
            boxShadow: "0px 10px 20px rgba(0,0,0,0.05)"
        }}
    >
        <h4 className="font-bold text-gray-800 mb-4">{title}</h4>
        <div className="space-y-3 text-sm text-gray-600">{children}</div>
    </motion.div>
));

const ModeMetric = ({ title, modes, onViewAll }) => {
    const hasModes = modes && modes.length > 0;
    const hasManyModes = hasModes && modes.length > 3;

    return (
        <div>
            <p>
                {title}:{' '}
                {!hasModes && <span className="font-mono text-gray-500">N/A (all unique)</span>}
            </p>
            {hasModes && (
                <div className="font-mono text-yellow-600 pl-2">
                    {modes.slice(0, 3).join(', ')}
                    {hasManyModes && (
                        <>
                            ...{' '}
                            <button
                                onClick={onViewAll}
                                className="text-blue-600 hover:underline text-xs ml-2 p-0 bg-transparent !shadow-none font-sans"
                            >
                                View All
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataAnalytics;