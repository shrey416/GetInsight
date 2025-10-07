// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import anime from 'animejs';

// Components
import Upload from './components/Upload';
import DataTable from './components/DataTable';
import DataStudio from './components/DataStudio';

const ShinyText = ({ text, trigger }) => {
    const textWrapper = useRef(null);

    useEffect(() => {
        if (textWrapper.current) {
            textWrapper.current.innerHTML = text.replace(/\S/g, "<span class='letter'>$&</span>");

            anime.timeline({ loop: false })
                .add({
                    targets: '.shiny-text .letter',
                    translateX: [40, 0],
                    translateZ: 0,
                    opacity: [0, 1],
                    easing: "easeOutExpo",
                    duration: 1200,
                    delay: (el, i) => 500 + 30 * i
                });
        }
    }, [text, trigger]); // re-run animation when trigger changes

    return (
        <h1 ref={textWrapper} className="shiny-text text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight">
            {text}
        </h1>
    );
};

const App = () => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [fileName, setFileName] = useState('');
    const [view, setView] = useState('upload'); // upload, data, studio
    const [shinyTrigger, setShinyTrigger] = useState(0);

    const handleFileUpload = (file) => {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            
            // Attempt to parse numbers from strings
            const parsedData = json.map(row => {
                const newRow = {};
                for (const key in row) {
                    const value = row[key];
                    if (typeof value === 'string' && !isNaN(parseFloat(value)) && isFinite(value)) {
                        newRow[key] = parseFloat(value);
                    } else {
                        newRow[key] = value;
                    }
                }
                return newRow;
            });
            
            setData(parsedData);
            setHeaders(Object.keys(parsedData[0] || {}));
            setView('data');
        };
        reader.readAsBinaryString(file);
    };
    
    const resetApp = () => {
        setData([]);
        setHeaders([]);
        setFileName('');
        setView('upload');
        setShinyTrigger(t => t + 1); // trigger shiny text animation
    }

    return (
        <div className="min-h-screen text-gray-800 p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-10">
                <div
                    onClick={resetApp}
                    className="cursor-pointer inline-block"
                >
                    <ShinyText text="GetInsights : Data Analytics and Visualization Tool" trigger={shinyTrigger} />
                </div>
                <p className="text-lg text-gray-500 mt-2">Upload a file to begin your analysis.</p>
            </header>

            <main>
                <AnimatePresence mode="wait">
                    {view === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Upload onFileUpload={handleFileUpload} />
                        </motion.div>
                    )}

                    {view === 'data' && (
                        <motion.div
                            key="data"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5 }}
                        >
                            <DataTable
                                headers={headers}
                                data={data}
                                fileName={fileName}
                                onAnalyze={() => setView('studio')}
                                onReset={resetApp}
                            />
                        </motion.div>
                    )}

                    {view === 'studio' && (
                        <motion.div
                            key="studio"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ duration: 0.5 }}
                        >
                            <DataStudio
                                data={data}
                                headers={headers}
                                onBack={() => setView('data')}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default App;