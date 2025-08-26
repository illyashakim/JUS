import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPrint, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaTint } from 'react-icons/fa';
import { printerAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await printerAPI.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Error loading dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-success-600';
      case 'offline':
        return 'text-gray-600';
      case 'error':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <FaCheckCircle className="text-success-600" />;
      case 'offline':
        return <FaTimesCircle className="text-gray-600" />;
      case 'error':
        return <FaExclamationTriangle className="text-danger-600" />;
      default:
        return <FaTimesCircle className="text-gray-600" />;
    }
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
          onClick={fetchDashboardData}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 text-lg">No data available</div>
      </div>
    );
  }

  const chartData = [
    { name: 'Online', value: dashboardData.online_printers, color: '#22c55e' },
    { name: 'Offline', value: dashboardData.offline_printers, color: '#6b7280' },
    { name: 'Error', value: dashboardData.error_printers, color: '#ef4444' },
  ];

  const statusData = [
    { name: 'Online', value: dashboardData.online_printers, color: '#22c55e' },
    { name: 'Offline', value: dashboardData.offline_printers, color: '#6b7280' },
    { name: 'Error', value: dashboardData.error_printers, color: '#ef4444' },
    { name: 'Low Toner', value: dashboardData.low_toner_printers, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your printer fleet status and performance</p>
        </div>
        <Link to="/add-printer" className="btn-primary">
          Add Printer
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100">
              <FaPrint className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Printers</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.total_printers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100">
              <FaCheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-success-600">{dashboardData.online_printers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <FaTimesCircle className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="text-2xl font-bold text-gray-600">{dashboardData.offline_printers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warning-100">
              <FaTint className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Toner</p>
              <p className="text-2xl font-bold text-warning-600">{dashboardData.low_toner_printers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Printer Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/printers"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <FaPrint className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">View All Printers</h4>
              <p className="text-sm text-gray-600">See detailed status of all printers</p>
            </div>
          </Link>

          <Link
            to="/add-printer"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <FaPlus className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Add New Printer</h4>
              <p className="text-sm text-gray-600">Monitor a new printer</p>
            </div>
          </Link>

          <button
            onClick={fetchDashboardData}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
          >
            <FaCheckCircle className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Refresh Data</h4>
              <p className="text-sm text-gray-600">Update all printer statuses</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;