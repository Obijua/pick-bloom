import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Save, Settings as SettingsIcon, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, isLoading } = useStore();
  const [formData, setFormData] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: type === 'number' ? Number(value) : value
      }));
      setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateSettings(formData);
      setHasChanges(false);
  };

  const handleResetData = async () => {
      await api.resetData();
  };

  if (isLoading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" /> System Settings
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="border-b border-gray-100 pb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Store Configuration</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                          <input 
                              type="text" 
                              name="siteName"
                              value={formData.siteName}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                          <input 
                              type="email" 
                              name="supportEmail"
                              value={formData.supportEmail}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                          <input 
                              type="text" 
                              name="contactPhone"
                              value={formData.contactPhone}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                      </div>
                  </div>
              </div>

              <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Financial Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost (₦)</label>
                          <input 
                              type="number" 
                              name="shippingCost"
                              value={formData.shippingCost}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (₦)</label>
                          <input 
                              type="number" 
                              name="freeShippingThreshold"
                              value={formData.freeShippingThreshold}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                          <input 
                              type="number" 
                              name="taxRate"
                              value={formData.taxRate}
                              onChange={handleChange}
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                      </div>
                  </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button 
                      type="submit" 
                      disabled={!hasChanges}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-colors ${
                          hasChanges 
                              ? 'bg-primary-600 text-white hover:bg-primary-700' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                      <Save className="h-5 w-5" /> Save Changes
                  </button>
              </div>
          </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6">
          <h2 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Danger Zone
          </h2>
          <div className="flex justify-between items-center">
              <div>
                  <p className="font-bold text-gray-900">Reset System Data</p>
                  <p className="text-sm text-gray-600">This will clear all orders, custom products, and user accounts. It restores the default demo data.</p>
              </div>
              
              {!showResetConfirm ? (
                  <button 
                      onClick={() => setShowResetConfirm(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                  >
                      Reset Data
                  </button>
              ) : (
                  <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-600">Are you sure?</span>
                      <button 
                          onClick={handleResetData}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                      >
                          Yes, Reset
                      </button>
                      <button 
                          onClick={() => setShowResetConfirm(false)}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                      >
                          Cancel
                      </button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;