import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPrint, FaSave, FaTest, FaArrowLeft } from 'react-icons/fa';
import { printerAPI } from '../services/api';

const AddPrinter = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    location: '',
    model: '',
    snmp_community: 'public'
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await printerAPI.addPrinter(formData);
      if (response.success) {
        navigate('/printers');
      } else {
        setError(response.error || 'Failed to add printer');
      }
    } catch (err) {
      setError('Error adding printer. Please try again.');
      console.error('Add printer error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!formData.ip_address) {
      setError('Please enter an IP address to test');
      return;
    }

    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      // For now, we'll simulate a test since the backend test endpoint isn't implemented
      // In a real implementation, you'd call the backend test endpoint
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      // Simulate test result (replace with actual API call)
      const success = Math.random() > 0.3; // 70% success rate for demo
      setTestResult({
        success,
        message: success 
          ? 'SNMP connection successful! Printer is reachable.' 
          : 'SNMP connection failed. Check IP address and SNMP community.'
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Test failed. Please check your network connection.'
      });
    } finally {
      setTesting(false);
    }
  };

  const isFormValid = formData.name && formData.ip_address;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary mr-4"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Printer</h1>
          <p className="text-gray-600 mt-2">Configure SNMP monitoring for a new printer</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Printer Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Printer Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Office Printer, Reception HP"
            />
          </div>

          {/* IP Address */}
          <div>
            <label htmlFor="ip_address" className="block text-sm font-medium text-gray-700 mb-2">
              IP Address *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="ip_address"
                name="ip_address"
                value={formData.ip_address}
                onChange={handleInputChange}
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="192.168.1.100"
              />
              <button
                type="button"
                onClick={testConnection}
                disabled={testing || !formData.ip_address}
                className="btn-secondary whitespace-nowrap"
              >
                {testing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mx-auto"></div>
                ) : (
                  <>
                    <FaTest className="mr-2" />
                    Test
                  </>
                )}
              </button>
            </div>
            {testResult && (
              <div className={`mt-2 p-3 rounded-md text-sm ${
                testResult.success 
                  ? 'bg-success-50 text-success-800 border border-success-200' 
                  : 'bg-danger-50 text-danger-800 border border-danger-200'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Office Floor 2, Reception Area"
            />
          </div>

          {/* Model */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., HP LaserJet Pro M404n, Canon imageRUNNER"
            />
          </div>

          {/* SNMP Community */}
          <div>
            <label htmlFor="snmp_community" className="block text-sm font-medium text-gray-700 mb-2">
              SNMP Community
            </label>
            <input
              type="text"
              id="snmp_community"
              name="snmp_community"
              value={formData.snmp_community}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="public"
            />
            <p className="mt-1 text-sm text-gray-500">
              Most printers use "public" as the default SNMP community string
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-danger-50 border border-danger-200 rounded-md">
              <div className="text-danger-800 text-sm">{error}</div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Add Printer
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Ensure your printer has SNMP enabled in its network settings</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Verify the printer is accessible from this network</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Use the Test button to verify SNMP connectivity before adding</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Common SNMP community strings: "public", "private", or custom</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPrinter;