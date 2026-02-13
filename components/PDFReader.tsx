import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFReaderProps {
    url: string;
}

const PDFReader: React.FC<PDFReaderProps> = ({ url }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl">
            <div className="border-4 border-white/10 rounded-lg overflow-hidden shadow-2xl">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="text-white p-10">Loading PDF...</div>}
                    error={<div className="text-red-500 p-10">Failed to load PDF. Check CORS settings.</div>}
                >
                    <Page
                        pageNumber={pageNumber}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={Math.min(window.innerWidth * 0.8, 600)}
                    />
                </Document>
            </div>

            <div className="flex items-center gap-4 mt-4">
                <button
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(prev => prev - 1)}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>
                <p className="text-white font-bold">
                    Page {pageNumber} of {numPages}
                </p>
                <button
                    disabled={pageNumber >= (numPages || 1)}
                    onClick={() => setPageNumber(prev => prev + 1)}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PDFReader;
