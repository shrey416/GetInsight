// src/components/CorrelationHeatmap.jsx
import React from 'react';
import Plot from 'react-plotly.js';

const CorrelationHeatmap = ({ data, headers }) => {
    const numericHeaders = headers.filter(header =>
        data.every(row => typeof row[header] === 'number' && isFinite(row[header]))
    );

    // Pearson correlation calculation
    function calculateCorrelation(x, y) {
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
        const n = x.length;
        for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumX2 += x[i] * x[i];
            sumY2 += y[i] * y[i];
        }
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        if (denominator === 0) return 0;
        return numerator / denominator;
    }
    
    const matrix = numericHeaders.map(header1 =>
        numericHeaders.map(header2 => {
            const col1 = data.map(row => row[header1]);
            const col2 = data.map(row => row[header2]);
            return calculateCorrelation(col1, col2);
        })
    );

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Correlation Heatmap</h3>
            <div className="w-full h-full overflow-hidden rounded-lg border border-gray-200">
                <Plot
                    data={[{
                        z: matrix,
                        x: numericHeaders,
                        y: numericHeaders,
                        type: 'heatmap',
                        colorscale: 'Blues',
                        reversescale: true,
                        zmin: -1,
                        zmax: 1
                    }]}
                    layout={{
                        title: 'Correlation Matrix of Numeric Columns',
                        autosize: true,
                        xaxis: { automargin: true },
                        yaxis: { automargin: true },
                    }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "600px" }}
                />
            </div>
        </div>
    );
};

export default CorrelationHeatmap;