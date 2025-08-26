import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, 
  Store, 
  DollarSign, 
  CreditCard, 
  Bell, 
  Settings as SettingsIcon,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import './Settings.css';

const API_BASE = import.meta.env.VITE_API_URL;

const Settings = () => {
  const [activeTab, setActiveTab] = useState('shop');
  const [settings, setSettings] = useState({
    shop: {
      name: '',
      address: '',
      phone: '',
      email: '',
      logo: null,
      currency: 'NRS',
      timezone: 'UTC'
    },
    tax: {
      rate: 0.1,
      inclusive: false
    },
    payments: {
      methods: ['cash', 'card'],
      defaultMethod: 'cash'
    },
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    system: {
      theme: 'light',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      currency: 'NRS'
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const tabs = [
    { id: 'shop', label: 'Shop Information', icon: Store },
    { id: 'tax', label: 'Tax Settings', icon: DollarSign },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System Settings', icon: SettingsIcon }
  ];

  const paymentMethods = [
    { id: 'cash', label: 'Cash' },
    { id: 'card', label: 'Credit/Debit Card' },
    { id: 'qr', label: 'QR Code Payment' },
    { id: 'online', label: 'Online Payment' }
  ];

  const currencies = [
    { value: 'NRS', label: 'Nepalese Rupee (Nrs)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'INR', label: 'Indian Rupee (₹)' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handlePaymentMethodToggle = (methodId) => {
    setSettings(prev => ({
      ...prev,
      payments: {
        ...prev.payments,
        methods: prev.payments.methods.includes(methodId)
          ? prev.payments.methods.filter(m => m !== methodId)
          : [...prev.payments.methods, methodId]
      }
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('shop', 'logo', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(`${API_BASE}/settings/${activeTab}`, settings[activeTab]);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderShopSettings = () => (
    <div className="settings-form">
      <div className="form-section">
        <h3 className="section-title">Basic Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Shop Name *</label>
            <input
              type="text"
              value={settings.shop.name}
              onChange={(e) => handleInputChange('shop', 'name', e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              value={settings.shop.phone}
              onChange={(e) => handleInputChange('shop', 'phone', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={settings.shop.email}
              onChange={(e) => handleInputChange('shop', 'email', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select
              value={settings.shop.currency}
              onChange={(e) => handleInputChange('shop', 'currency', e.target.value)}
              className="form-select"
            >
              {currencies.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea
            value={settings.shop.address}
            onChange={(e) => handleInputChange('shop', 'address', e.target.value)}
            className="form-textarea"
            rows="3"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Logo</h3>
        <div className="logo-upload">
          <div className="logo-preview" onClick={() => document.getElementById('logo-input').click()}>
            {settings.shop.logo ? (
              <img src={settings.shop.logo} alt="Shop Logo" />
            ) : (
              <div className="upload-placeholder">
                <Upload size={32} />
                <div className="upload-text">
                  Click to upload logo<br />
                  <small>PNG, JPG up to 2MB</small>
                </div>
              </div>
            )}
          </div>
          <input
            id="logo-input"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="file-input"
          />
        </div>
      </div>
    </div>
  );

  const renderTaxSettings = () => (
    <div className="settings-form">
      <div className="form-section">
        <h3 className="section-title">Tax Configuration</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Tax Rate (%)</label>
            <input
              type="number"
              value={settings.tax.rate * 100}
              onChange={(e) => handleInputChange('tax', 'rate', parseFloat(e.target.value) / 100)}
              className="form-input"
              step="0.01"
              min="0"
              max="100"
            />
          </div>
        </div>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.tax.inclusive}
              onChange={(e) => handleInputChange('tax', 'inclusive', e.target.checked)}
            />
            Tax Inclusive Pricing
          </label>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="settings-form">
      <div className="form-section">
        <h3 className="section-title">Accepted Payment Methods</h3>
        <div className="payment-methods">
          {paymentMethods.map(method => (
            <label
              key={method.id}
              className={`payment-method ${settings.payments.methods.includes(method.id) ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={settings.payments.methods.includes(method.id)}
                onChange={() => handlePaymentMethodToggle(method.id)}
              />
              {method.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Default Payment Method</h3>
        <div className="radio-group">
          {paymentMethods
            .filter(method => settings.payments.methods.includes(method.id))
            .map(method => (
              <label key={method.id} className="radio-label">
                <input
                  type="radio"
                  name="defaultPayment"
                  value={method.id}
                  checked={settings.payments.defaultMethod === method.id}
                  onChange={(e) => handleInputChange('payments', 'defaultMethod', e.target.value)}
                />
                {method.label}
              </label>
            ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-form">
      <div className="form-section">
        <h3 className="section-title">Notification Preferences</h3>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => handleInputChange('notifications', 'email', e.target.checked)}
            />
            Email Notifications
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications.sms}
              onChange={(e) => handleInputChange('notifications', 'sms', e.target.checked)}
            />
            SMS Notifications
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications.push}
              onChange={(e) => handleInputChange('notifications', 'push', e.target.checked)}
            />
            Push Notifications
          </label>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="settings-form">
      <div className="form-section">
        <h3 className="section-title">System Preferences</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Language</label>
            <select
              value={settings.system.language}
              onChange={(e) => handleInputChange('system', 'language', e.target.value)}
              className="form-select"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date Format</label>
            <select
              value={settings.system.dateFormat}
              onChange={(e) => handleInputChange('system', 'dateFormat', e.target.value)}
              className="form-select"
            >
              {dateFormats.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="radio-group">
          <h4>Theme</h4>
          <label className="radio-label">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={settings.system.theme === 'light'}
              onChange={(e) => handleInputChange('system', 'theme', e.target.value)}
            />
            Light Theme
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={settings.system.theme === 'dark'}
              onChange={(e) => handleInputChange('system', 'theme', e.target.value)}
            />
            Dark Theme
          </label>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'shop':
        return renderShopSettings();
      case 'tax':
        return renderTaxSettings();
      case 'payments':
        return renderPaymentSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return null;
    }
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Configure your tea shop management system</p>
      </div>

      <div className="settings-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="settings-content">
        {message.text && (
          <div className={`${message.type}-message`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        {renderTabContent()}

        <div className="settings-actions">
          <button
            className="settings-btn settings-btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <Save size={16} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
