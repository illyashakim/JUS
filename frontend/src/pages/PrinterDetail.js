import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPrint, FaArrowLeft, FaSync, FaTint, FaMapMarkerAlt, FaServer, FaClock, FaInfoCircle } from 'react-icons/fa';
import { printerAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PrinterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [printer, setPrinter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchPrinterDetails();
  }, [id]);

  const fetchPrinterDetails = async () => {
    try {
      setLoading(true);
      const response = await printerAPI.getPrinter(id);
      if (response.success) {
        setPrinter(response.data);
      } else {
        setError('Failed to fetch printer details');
      }
    } catch (err) {
      setError('Error loading printer details');
      console.error('Printer detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanPrinter = async () => {
    try {
      setScanning(true);
      const response = await printerAPI.scanPrinter(id);
      if (response.success) {
        setPrinter(prev => ({ ...prev, ...response.data }));
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
          onClick={fetchPrinterDetails}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!printer) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 text-lg">Printer not found</div>
      </div>
    );
  }

  // Prepare chart data for status history
  const statusChartData = printer.status_history?.map((status, index) => ({
    time: new Date(status.timestamp).toLocaleTimeString(),
    status: status.status === 'online' ? 1 : status.status === 'offline' ? 0 : 0.5,
    label: status.status
  })) || [];

  // Prepare chart data for toner levels
  const tonerChartData = printer.toner_levels?.map((toner, index) => ({
    time: new Date(toner.timestamp).toLocaleTimeString(),
    level: toner.percentage,
    cartridge: toner.cartridge_name
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary mr-4"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{printer.name}</h1>
            <p className="text-gray-600 mt-2">Printer Details & Monitoring</p>
          </div>
        </div>
        <button
          onClick={handleScanPrinter}
          disabled={scanning}
          className="btn-primary"
        >
          {scanning ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
          ) : (
            <>
              <FaSync className="mr-2" />
              Scan Now
            </>
          )}
        </button>
      </div>

      {/* Printer Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <FaPrint className="h-5 w-5 text-primary-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-gray-900">{printer.name}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaServer className="h-5 w-5 text-primary-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">IP Address</p>
                <p className="text-gray-900 font-mono">{printer.ip_address}</p>
              </div>
            </div>

            {printer.location && (
              <div className="flex items-center">
                <FaMapMarkerAlt className="h-5 w-5 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-gray-900">{printer.location}</p>
                </div>
              </div>
            )}

            {printer.model && (
              <div className="flex items-center">
                <FaServer className="h-5 w-5 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Model</p>
                  <p className="text-gray-900">{printer.model}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
          <div className="space-y-4">
            <div className="text-center">
              {getStatusBadge(printer.status)}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Last Seen</p>
              <p className="text-gray-900 font-medium">
                {printer.last_seen ? formatDate(printer.last_seen) : 'Never'}
              </p>
            </div>

            {printer.toner_levels && printer.toner_levels.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Latest Toner Level</p>
                <p className={`text-lg font-bold ${getTonerLevelColor(printer.toner_levels[0].percentage)}`}>
                  {printer.toner_levels[0].percentage}%
                </p>
                <p className="text-sm text-gray-600">{printer.toner_levels[0].cartridge_name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">
                {printer.status_history?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Status Checks</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">
                {printer.toner_levels?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Toner Readings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {printer.status_history && printer.status_history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status History Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 1]} ticks={[0, 0.5, 1]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="status" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Toner Levels Chart */}
          {printer.toner_levels && printer.toner_levels.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Toner Level History</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tonerChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="level" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status History */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
          {printer.status_history && printer.status_history.length > 0 ? (
            <div className="space-y-3">
              {printer.status_history.map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaClock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{formatDate(status.timestamp)}</span>
                  </div>
                  {getStatusBadge(status.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaInfoCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No status history available</p>
            </div>
          )}
        </div>

        {/* Toner Levels */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Toner Levels</h3>
          {printer.toner_levels && printer.toner_levels.length > 0 ? (
            <div className="space-y-3">
              {printer.toner_levels.map((toner, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{toner.cartridge_name}</span>
                    <span className={`font-bold ${getTonerLevelColor(toner.percentage)}`}>
                      {toner.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        toner.percentage < 20 ? 'bg-danger-600' :
                        toner.percentage < 50 ? 'bg-warning-600' : 'bg-success-600'
                      }`}
                      style={{ width: `${toner.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{toner.current_level} / {toner.max_level}</span>
                    <span>{formatDate(toner.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaTint className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No toner level data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrinterDetail;