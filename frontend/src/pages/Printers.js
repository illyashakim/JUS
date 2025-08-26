import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPrint, FaEye, FaTrash, FaSync, FaTint, FaMapMarkerAlt, FaServer } from 'react-icons/fa';
import { printerAPI } from '../services/api';

const Printers = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState({});

  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const response = await printerAPI.getPrinters();
      if (response.success) {
        setPrinters(response.data);
      } else {
        setError('Failed to fetch printers');
      }
    } catch (err) {
      setError('Error loading printers');
      console.error('Printers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanPrinter = async (printerId) => {
    try {
      setScanning(prev => ({ ...prev, [printerId]: true }));
      const response = await printerAPI.scanPrinter(printerId);
      if (response.success) {
        // Update the printer in the list
        setPrinters(prev => prev.map(printer => 
          printer.id === printerId 
            ? { ...printer, ...response.data }
            : printer
        ));
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setScanning(prev => ({ ...prev, [printerId]: false }));
    }
  };

  const handleDeletePrinter = async (printerId) => {
    if (window.confirm('Are you sure you want to delete this printer?')) {
      try {
        const response = await printerAPI.deletePrinter(printerId);
        if (response.success) {
          setPrinters(prev => prev.filter(printer => printer.id !== printerId));
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      online: 'status-online',
      offline: 'status-offline',
      error: 'status-error',
      unknown: 'status-warning'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || statusClasses.unknown}`}>
        {status}
      </span>
    );
  };

  const getTonerLevelColor = (percentage) => {
    if (percentage === null || percentage === undefined) return 'text-gray-400';
    if (percentage < 20) return 'text-danger-600';
    if (percentage < 50) return 'text-warning-600';
    return 'text-success-600';
  };

  const getTonerLevelText = (percentage) => {
    if (percentage === null || percentage === undefined) return 'Unknown';
    return `${percentage}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-danger-600 text-lg mb-4">{error}</div>
        <button 
          onClick={fetchPrinters}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Printers</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your printer fleet</p>
        </div>
        <Link to="/add-printer" className="btn-primary">
          Add Printer
        </Link>
      </div>

      {/* Printers Grid */}
      {printers.length === 0 ? (
        <div className="text-center py-12">
          <FaPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No printers found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first printer to monitor</p>
          <Link to="/add-printer" className="btn-primary">
            Add Your First Printer
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {printers.map((printer) => (
            <div key={printer.id} className="card hover:shadow-lg transition-shadow">
              {/* Printer Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <FaPrint className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{printer.name}</h3>
                    <p className="text-sm text-gray-600">{printer.ip_address}</p>
                  </div>
                </div>
                {getStatusBadge(printer.status)}
              </div>

              {/* Printer Details */}
              <div className="space-y-3 mb-4">
                {printer.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    {printer.location}
                  </div>
                )}
                
                {printer.model && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaServer className="mr-2" />
                    {printer.model}
                  </div>
                )}

                {printer.toner_level !== null && printer.toner_level !== undefined && (
                  <div className="flex items-center text-sm">
                    <FaTint className="mr-2" />
                    <span className="text-gray-600">Toner:</span>
                    <span className={`ml-1 font-medium ${getTonerLevelColor(printer.toner_level)}`}>
                      {getTonerLevelText(printer.toner_level)}
                    </span>
                  </div>
                )}

                {printer.last_seen && (
                  <div className="text-xs text-gray-500">
                    Last seen: {new Date(printer.last_seen).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <Link
                  to={`/printers/${printer.id}`}
                  className="flex-1 btn-secondary text-center text-sm"
                >
                  <FaEye className="inline mr-1" />
                  View
                </Link>
                
                <button
                  onClick={() => handleScanPrinter(printer.id)}
                  disabled={scanning[printer.id]}
                  className="flex-1 btn-primary text-center text-sm"
                >
                  {scanning[printer.id] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  ) : (
                    <>
                      <FaSync className="inline mr-1" />
                      Scan
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleDeletePrinter(printer.id)}
                  className="btn-danger text-sm px-3"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchPrinters}
          className="btn-secondary"
        >
          <FaSync className="inline mr-2" />
          Refresh All Printers
        </button>
      </div>
    </div>
  );
};

export default Printers;