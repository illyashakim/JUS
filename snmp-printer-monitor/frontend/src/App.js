import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from './hooks/useSocket';
import { printerAPI, monitoringAPI } from './utils/api';
import Header from './components/Header';
import PrinterGrid from './components/PrinterGrid';
import AddPrinterModal from './components/AddPrinterModal';
import MonitoringControls from './components/MonitoringControls';
import ConnectionStatus from './components/ConnectionStatus';
import { Printer, Plus, Activity, AlertTriangle } from 'lucide-react';

function App() {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [monitoringActive, setMonitoringActive] = useState(false);
  const { connected, on, off, emit } = useSocket();

  // Load initial data
  useEffect(() => {
    loadPrinters();
    loadMonitoringStatus();
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (connected) {
      // Listen for printer updates
      const handlePrinterUpdate = (updatedPrinter) => {
        setPrinters(prevPrinters => 
          prevPrinters.map(printer => 
            printer.id === updatedPrinter.id ? { ...printer, ...updatedPrinter } : printer
          )
        );
      };

      // Listen for printer list updates
      const handlePrintersList = (printersList) => {
        setPrinters(printersList);
      };

      on('printer_update', handlePrinterUpdate);
      on('printers_list', handlePrintersList);

      return () => {
        off('printer_update', handlePrinterUpdate);
        off('printers_list', handlePrintersList);
      };
    }
  }, [connected, on, off]);

  const loadPrinters = async () => {
    try {
      setLoading(true);
      const response = await printerAPI.getPrinters();
      setPrinters(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load printers');
      console.error('Error loading printers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMonitoringStatus = async () => {
    try {
      const response = await monitoringAPI.getMonitoringStatus();
      setMonitoringActive(response.data.active);
    } catch (err) {
      console.error('Error loading monitoring status:', err);
    }
  };

  const handleAddPrinter = async (printerData) => {
    try {
      const response = await printerAPI.addPrinter(printerData);
      setPrinters(prev => [...prev, response.data]);
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      setError('Failed to add printer');
      console.error('Error adding printer:', err);
    }
  };

  const handleRemovePrinter = async (printerId) => {
    try {
      await printerAPI.removePrinter(printerId);
      setPrinters(prev => prev.filter(printer => printer.id !== printerId));
      setError(null);
    } catch (err) {
      setError('Failed to remove printer');
      console.error('Error removing printer:', err);
    }
  };

  const handleTestPrinter = async (printerId) => {
    try {
      const response = await printerAPI.testPrinter(printerId);
      if (response.data.success) {
        setPrinters(prev => 
          prev.map(printer => 
            printer.id === printerId ? { ...printer, ...response.data.data } : printer
          )
        );
      }
      setError(null);
    } catch (err) {
      setError('Failed to test printer connection');
      console.error('Error testing printer:', err);
    }
  };

  const handleStartMonitoring = async () => {
    try {
      await monitoringAPI.startMonitoring();
      setMonitoringActive(true);
      setError(null);
    } catch (err) {
      setError('Failed to start monitoring');
      console.error('Error starting monitoring:', err);
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await monitoringAPI.stopMonitoring();
      setMonitoringActive(false);
      setError(null);
    } catch (err) {
      setError('Failed to stop monitoring');
      console.error('Error stopping monitoring:', err);
    }
  };

  const handleRefresh = useCallback(() => {
    if (connected) {
      emit('request_update');
    }
    loadPrinters();
  }, [connected, emit]);

  const getStatusSummary = () => {
    const total = printers.length;
    const online = printers.filter(p => p.online).length;
    const offline = total - online;
    const lowToner = printers.filter(p => 
      Object.values(p.toner_levels || {}).some(toner => 
        toner.status === 'low' || toner.status === 'critical'
      )
    ).length;

    return { total, online, offline, lowToner };
  };

  const statusSummary = getStatusSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading printer monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status */}
        <ConnectionStatus connected={connected} />

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Printer className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Printers</dt>
                    <dd className="text-lg font-medium text-gray-900">{statusSummary.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Online</dt>
                    <dd className="text-lg font-medium text-gray-900">{statusSummary.online}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-red-500 rounded-full"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Offline</dt>
                    <dd className="text-lg font-medium text-gray-900">{statusSummary.offline}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Low Supplies</dt>
                    <dd className="text-lg font-medium text-gray-900">{statusSummary.lowToner}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <MonitoringControls
            isActive={monitoringActive}
            onStart={handleStartMonitoring}
            onStop={handleStopMonitoring}
            onRefresh={handleRefresh}
          />

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Printer
          </button>
        </div>

        {/* Printer Grid */}
        <PrinterGrid
          printers={printers}
          onRemove={handleRemovePrinter}
          onTest={handleTestPrinter}
        />

        {/* Empty State */}
        {printers.length === 0 && (
          <div className="text-center py-12">
            <Printer className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No printers configured</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first printer to monitor.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Printer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Printer Modal */}
      {showAddModal && (
        <AddPrinterModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddPrinter}
        />
      )}
    </div>
  );
}

export default App;