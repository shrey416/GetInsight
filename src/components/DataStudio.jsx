// src/components/DataStudio.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components for the studio
import DataAnalytics from './DataAnalytics';
import CorrelationHeatmap from './CorrelationHeatmap';
import PlottingStudio from './PlottingStudio';
import SkewnessCheck from './SkewnessCheck';

const DataStudio = ({ data, headers, onBack }) => {
    const [activeTab, setActiveTab] = useState('analytics');

    // If data or headers are missing, go back to initial page
    React.useEffect(() => {
        if (!data || !headers || data.length === 0 || headers.length === 0) {
            if (typeof onBack === 'function') onBack();
        }
    }, [data, headers, onBack]);

    const renderContent = () => {
        switch (activeTab) {
            case 'analytics':
                return <DataAnalytics data={data} headers={headers} />;
            case 'heatmap':
                return <CorrelationHeatmap data={data} headers={headers} />;
            case 'plotting':
                return <PlottingStudio data={data} headers={headers} />;
            case 'skewness':
                return <SkewnessCheck data={data} headers={headers} />;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <motion.button
                onClick={onBack}
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg border border-blue-600 hover:bg-blue-700 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                &larr; Back to Data Preview
            </motion.button>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                <div className="flex gap-4 border-b border-gray-200 mb-6">
                    <TabButton name="analytics" activeTab={activeTab} setActiveTab={setActiveTab}>
                        Data Analytics
                    </TabButton>
                    <TabButton name="heatmap" activeTab={activeTab} setActiveTab={setActiveTab}>
                        Correlation Heatmap
                    </TabButton>
                    <TabButton name="plotting" activeTab={activeTab} setActiveTab={setActiveTab}>
                    Plotting Studio
                </TabButton>
                <TabButton name="skewness" activeTab={activeTab} setActiveTab={setActiveTab}>
                    Skewness Check
                </TabButton>
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    </div>
    );
}

const TabButton = ({ name, activeTab, setActiveTab, children }) => {
    const isActive = activeTab === name;
    return (
        <button
            onClick={() => setActiveTab(name)}
            className={`relative px-4 py-2 text-sm sm:text-base font-medium rounded-lg transition-colors
                ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
            `}
            style={{ minWidth: 140 }}
        >
            {children}
            {isActive && (
                <motion.div
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded"
                    layoutId="underline"
                />
            )}
        </button>
    );
};

export default DataStudio;