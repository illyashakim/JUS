import React from 'react';
import PrinterCard from './PrinterCard';

const PrinterGrid = ({ printers, onRemove, onTest }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {printers.map((printer) => (
        <PrinterCard
          key={printer.id}
          printer={printer}
          onRemove={onRemove}
          onTest={onTest}
        />
      ))}
    </div>
  );
};

export default PrinterGrid;