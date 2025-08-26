import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddPrinterModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    port: '161',
    community: 'public'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Printer name is required';
    }

    if (!formData.ip.trim()) {
      newErrors.ip = 'IP address is required';
    } else {
      // Basic IP validation
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.ip)) {
        newErrors.ip = 'Please enter a valid IP address';
      }
    }

    if (!formData.port.trim()) {
      newErrors.port = 'Port is required';
    } else {
      const port = parseInt(formData.port);
      if (isNaN(port) || port < 1 || port > 65535) {
        newErrors.port = 'Port must be a number between 1 and 65535';
      }
    }

    if (!formData.community.trim()) {
      newErrors.community = 'SNMP community is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        ...formData,
        port: parseInt(formData.port)
      });
    } catch (error) {
      console.error('Error adding printer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add New Printer
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {/* Printer Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Printer Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Office Printer"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* IP Address */}
                  <div>
                    <label htmlFor="ip" className="block text-sm font-medium text-gray-700">
                      IP Address *
                    </label>
                    <input
                      type="text"
                      id="ip"
                      name="ip"
                      value={formData.ip}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.ip ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="192.168.1.100"
                    />
                    {errors.ip && (
                      <p className="mt-1 text-sm text-red-600">{errors.ip}</p>
                    )}
                  </div>

                  {/* Port */}
                  <div>
                    <label htmlFor="port" className="block text-sm font-medium text-gray-700">
                      SNMP Port *
                    </label>
                    <input
                      type="text"
                      id="port"
                      name="port"
                      value={formData.port}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.port ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="161"
                    />
                    {errors.port && (
                      <p className="mt-1 text-sm text-red-600">{errors.port}</p>
                    )}
                  </div>

                  {/* Community */}
                  <div>
                    <label htmlFor="community" className="block text-sm font-medium text-gray-700">
                      SNMP Community *
                    </label>
                    <input
                      type="text"
                      id="community"
                      name="community"
                      value={formData.community}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.community ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="public"
                    />
                    {errors.community && (
                      <p className="mt-1 text-sm text-red-600">{errors.community}</p>
                    )}
                  </div>

                  <div className="mt-6 text-xs text-gray-500">
                    * Required fields
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Printer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPrinterModal;