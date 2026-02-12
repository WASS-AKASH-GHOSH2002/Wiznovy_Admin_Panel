import React, { useEffect, useState } from 'react';
import { RefreshCw, Edit, Save } from 'lucide-react';
import Modal from '../components/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchsettings, updatesettings } from '../store/settingSlice';
import { toast } from 'react-toastify';

export default function Settings() {
  const dispatch = useDispatch();
  const { setting, loading, error } = useSelector((state) => state.setting);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    dispatch(fetchsettings());
  }, [dispatch]);

  const handleEdit = (field, label, value) => {
    setEditField({ field, label });
    setEditValue(value || '');
    setShowEditModal(true);
  };

  const getInputType = (field) => {
    if (['zoomEnabled', 'stripeEnabled', 'emailEnabled'].includes(field)) return 'select';
    if (['emailPort', 'sessionCommissionRate', 'courseCommissionRate', 'pdfMargin'].includes(field)) return 'number';
    if (field === 'email') return 'email';
    return 'text';
  };

  const getMaxLength = (field) => {
    if (field === 'title') return 50;
    if (field === 'email') return 100;
    if (field === 'companyName') return 100;
    if (field === 'companyAddress') return 255;
    if (field === 'companyPhone') return 20;
    if (field === 'currency') return 10;
    return null;
  };

  const handleSave = async () => {
    if (!editField || !setting?.id) return;

    let finalValue = editValue;

    // Convert boolean fields
    if (['zoomEnabled', 'stripeEnabled', 'emailEnabled'].includes(editField.field)) {
      finalValue = editValue === 'true';
    }
    // Convert number fields
    else if (['emailPort', 'sessionCommissionRate', 'courseCommissionRate', 'pdfMargin', 'gstPercentage'].includes(editField.field)) {
      finalValue = Number(editValue);
      if (Number.isNaN(finalValue)) {
        toast.error('Please enter a valid number');
        return;
      }
    }

    try {
      await dispatch(updatesettings({ id: setting.id, field: editField.field, value: finalValue })).unwrap();
      toast.success('Setting updated successfully!');
      setShowEditModal(false);
      setEditField(null);
      setEditValue('');
      handleRefresh();
    } catch (error) {
      console.error('Update failed:', error);
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to update setting';
      toast.error(errorMessage);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchsettings());
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const SettingField = ({ label, value, field }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-700 text-sm mb-1">{label}</h4>
          <p className="text-xs text-gray-500 font-mono">{field}</p>
        </div>
        <button
          onClick={() => handleEdit(field, label, value)}
          className="text-blue-600 hover:text-blue-800"
          title="Edit"
        >
          <Edit size={16} />
        </button>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-sm text-gray-800 break-all">
          {value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-gray-400 italic">Not set</span>}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button onClick={handleRefresh} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!setting) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
            <button onClick={handleRefresh} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={() => scrollToSection('general-settings')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">General Settings</button>
            <button onClick={() => scrollToSection('company-details')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Company Details</button>
            <button onClick={() => scrollToSection('branding-links')} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">Branding & Links</button>
            <button onClick={() => scrollToSection('invoice-tax')} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Invoice & Tax Settings</button>
            <button onClick={() => scrollToSection('commission-settings')} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">Commission Settings</button>
            <button onClick={() => scrollToSection('zoom-integration')} className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">Zoom Integration</button>
            <button onClick={() => scrollToSection('stripe-payment')} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">Stripe Payment Settings</button>
            <button onClick={() => scrollToSection('email-configuration')} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">Email Configuration</button>
          </div>
          <div id="general-settings" className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">General Settings</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField label="Title" value={setting.title} field="title" />
              <SettingField label="Email" value={setting.email} field="email" />
              <SettingField label="Language" value={setting.language} field="language" />
              <SettingField label="Timezone" value={setting.timezone} field="timezone" />
              <SettingField label="Currency" value={setting.currency} field="currency" />
              <SettingField label="Status" value={setting.status} field="status" />
            </div>
          </div>

          <div id="company-details" className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Company Details</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField label="Company Name" value={setting.companyName} field="companyName" />
              <SettingField label="Company Address" value={setting.companyAddress} field="companyAddress" />
              <SettingField label="Company City" value={setting.companyCity} field="companyCity" />
              <SettingField label="Company Phone" value={setting.companyPhone} field="companyPhone" />
              <SettingField label="Company GSTIN" value={setting.companyGstin} field="companyGstin" />
            </div>
          </div>

          <div id="branding-links" className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Branding & Links</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField label="Logo" value={setting.logo} field="logo" />
              <SettingField label="Logo Path" value={setting.logoPath} field="logoPath" />
              <SettingField label="Domain" value={setting.domain} field="domain" />
              <SettingField label="WhatsApp Link" value={setting.wpLink} field="wpLink" />
              <SettingField label="Facebook Link" value={setting.fbLink} field="fbLink" />
              <SettingField label="Instagram Link" value={setting.instaLink} field="instaLink" />
            </div>
          </div>

          <div id="invoice-tax" className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Invoice & Tax Settings</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField label="PDF Margin" value={setting.pdfMargin} field="pdfMargin" />
              <SettingField label="Invoice Declaration" value={setting.invoiceDeclaration} field="invoiceDeclaration" />
              <SettingField label="GST Percentage" value={setting.gstPercentage} field="gstPercentage" />
            </div>
          </div>

          <div id="commission-settings" className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Commission Settings</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField label="Session Commission Rate" value={setting.sessionCommissionRate} field="sessionCommissionRate" />
              <SettingField label="Course Commission Rate" value={setting.courseCommissionRate} field="courseCommissionRate" />
            </div>
          </div>

          <div id="zoom-integration" className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Zoom Integration</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField label="Zoom Enabled" value={String(setting.zoomEnabled)} field="zoomEnabled" />
              <SettingField label="Zoom API Key" value={setting.zoomApiKey} field="zoomApiKey" />
              <SettingField label="Zoom API Secret" value={setting.zoomApiSecret} field="zoomApiSecret" />
            </div>
          </div>

          <div id="stripe-payment" className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Stripe Payment Settings</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField label="Stripe Enabled" value={String(setting.stripeEnabled)} field="stripeEnabled" />
              <SettingField label="Stripe Public Key" value={setting.stripePublicKey} field="stripePublicKey" />
              <SettingField label="Stripe Secret Key" value={setting.stripeSecretKey} field="stripeSecretKey" />
            </div>
          </div>

          <div id="email-configuration" className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Email Configuration</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField label="Email Enabled" value={String(setting.emailEnabled)} field="emailEnabled" />
              <SettingField label="Email Host" value={setting.emailHost} field="emailHost" />
              <SettingField label="Email Port" value={setting.emailPort} field="emailPort" />
              <SettingField label="Email User" value={setting.emailUser} field="emailUser" />
              <SettingField label="Email Password" value={setting.emailPassword} field="emailPassword" />
            </div>
          </div>
        </div>

        <Modal
          isOpen={showEditModal && editField}
          onClose={() => setShowEditModal(false)}
          title="Edit Setting"
          maxWidth="max-w-md"
          position="center"
        >
          {editField && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                  <input
                    type="text"
                    value={editField.label}
                    disabled
                    className="w-full border border-gray-300 p-2 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value *</label>
                  {getInputType(editField.field) === 'select' ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : getInputType(editField.field) === 'number' ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg"
                      min="0"
                      max={editField.field === 'emailPort' ? 65535 : 100}
                    />
                  ) : (
                    <input
                      type={getInputType(editField.field)}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg"
                      maxLength={getMaxLength(editField.field)}
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Save
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}
