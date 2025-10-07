// src/components/DataTable.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PAGE_SIZE = 50;

const DataTable = ({
    headers,
    data,
    fileName,
    onAnalyze,
    onReset
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(data.length / PAGE_SIZE);

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, maxPage));
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const currentData = data.slice(startIndex, endIndex);

    // Helper to check if a value is a date string
    const isDate = (value) => {
        // Try to parse date and check if valid
        const date = new Date(value);
        return (
            typeof value === 'string' &&
            !isNaN(date.getTime()) &&
            value.match(/^\d{4}-\d{2}-\d{2}/)
        );
    };

    return (
        <div className="flex flex-col items-center">
            <motion.div
                className="w-full max-w-7xl bg-white rounded-2xl shadow-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Data Preview</h2>
                        <p className="text-gray-500 truncate max-w-md">{fileName}</p>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                        <motion.button
                            onClick={onReset}
                            className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 !shadow-none"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            New File
                        </motion.button>
                        <motion.button
                            onClick={onAnalyze}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Analyze Data &rarr;
                        </motion.button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {headers.map((header) => (
                                    <th
                                        key={header}
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentData.map((row, i) => (
                                <tr key={row.id || i} className="hover:bg-gray-50">
                                    {headers.map((header) => (
                                        <td
                                            key={header}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                                        >
                                            {isDate(row[header])
                                                ? new Date(row[header]).toLocaleDateString()
                                                : String(row[header])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600 gap-4">
                    <p>
                        Showing rows{' '}
                        <span className="font-semibold">{data.length === 0 ? 0 : startIndex + 1}</span> to{' '}
                        <span className="font-semibold">{Math.min(endIndex, data.length)}</span> of{' '}
                        <span className="font-semibold">{data.length}</span>
                    </p>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 !text-gray-700 !shadow-none disabled:!bg-gray-100 disabled:!text-gray-400"
                        >
                            &larr; Previous
                        </button>
                        <span>
                            Page {currentPage} of {maxPage}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === maxPage}
                            className="px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 !text-gray-700 !shadow-none disabled:!bg-gray-100 disabled:!text-gray-400"
                        >
                            Next &rarr;
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DataTable;