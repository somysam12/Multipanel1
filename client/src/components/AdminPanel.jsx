import { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardIcon, UsersIcon, PackageIcon, GiftIcon, MenuIcon, UserIcon, LogoutIcon, WalletIcon, PlusIcon, TrashIcon, EditIcon, LockIcon, WrenchIcon, KeyIcon, UploadIcon, HistoryIcon, DownloadIcon } from './Icons';

const API_URL = '/api';

function AdminPanel({ user, onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const token = localStorage.getItem('token');

  return (
    <div className="user-panel-new">
      <div className={`sidebar-left ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header-new">
          <WrenchIcon size={32} />
          <h2 className="sidebar-title">Admin Panel</h2>
        </div>
        <div className="sidebar-nav-new">
          <div 
            className={`nav-item-new ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <DashboardIcon size={20} />
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'add-mod' ? 'active' : ''}`}
            onClick={() => setCurrentPage('add-mod')}
          >
            <PlusIcon size={20} />
            <span>Add Mod Name</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'manage-mods' ? 'active' : ''}`}
            onClick={() => setCurrentPage('manage-mods')}
          >
            <EditIcon size={20} />
            <span>Manage Mods</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'upload-apk' ? 'active' : ''}`}
            onClick={() => setCurrentPage('upload-apk')}
          >
            <UploadIcon size={20} />
            <span>Upload Mod APK</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'apk-list' ? 'active' : ''}`}
            onClick={() => setCurrentPage('apk-list')}
          >
            <PackageIcon size={20} />
            <span>Mod APK List</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'add-license' ? 'active' : ''}`}
            onClick={() => setCurrentPage('add-license')}
          >
            <KeyIcon size={20} />
            <span>Add License Key</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'license-list' ? 'active' : ''}`}
            onClick={() => setCurrentPage('license-list')}
          >
            <KeyIcon size={20} />
            <span>License Key List</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'available-keys' ? 'active' : ''}`}
            onClick={() => setCurrentPage('available-keys')}
          >
            <KeyIcon size={20} />
            <span>Available Keys</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'manage-users' ? 'active' : ''}`}
            onClick={() => setCurrentPage('manage-users')}
          >
            <UsersIcon size={20} />
            <span>Manage Users</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'add-balance' ? 'active' : ''}`}
            onClick={() => setCurrentPage('add-balance')}
          >
            <WalletIcon size={20} />
            <span>Add Balance</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'transaction' ? 'active' : ''}`}
            onClick={() => setCurrentPage('transaction')}
          >
            <HistoryIcon size={20} />
            <span>Transaction</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'referral' ? 'active' : ''}`}
            onClick={() => setCurrentPage('referral')}
          >
            <GiftIcon size={20} />
            <span>Referral Code</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentPage('settings')}
          >
            <WrenchIcon size={20} />
            <span>Settings</span>
          </div>
          <div 
            className="nav-item-new"
            onClick={onLogout}
          >
            <LogoutIcon size={20} />
            <span>Logout</span>
          </div>
        </div>
      </div>

      <div className="main-content-new">
        <div className="top-header-new">
          <div className="header-welcome">
            Welcome, <span className="username-badge">{user.username}</span>
          </div>
        </div>

        <div className="content-area-new">
          {currentPage === 'dashboard' && <DashboardPage token={token} />}
          {currentPage === 'add-mod' && <AddModPage token={token} />}
          {currentPage === 'manage-mods' && <ManageModsPage token={token} />}
          {currentPage === 'upload-apk' && <UploadAPKPage token={token} />}
          {currentPage === 'apk-list' && <APKListPage token={token} />}
          {currentPage === 'add-license' && <AddLicensePage token={token} />}
          {currentPage === 'license-list' && <LicenseListPage token={token} />}
          {currentPage === 'available-keys' && <AvailableKeysPage token={token} />}
          {currentPage === 'manage-users' && <ManageUsersPage token={token} />}
          {currentPage === 'add-balance' && <AddBalancePage token={token} />}
          {currentPage === 'transaction' && <TransactionPage token={token} />}
          {currentPage === 'referral' && <ReferralPage token={token} />}
          {currentPage === 'settings' && <SettingsPage user={user} token={token} />}
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ token }) {
  const [stats, setStats] = useState({ mods: 0, keys: 0, users: 0, sold: 0 });
  const [recentMods, setRecentMods] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productsRes, usersRes, purchasesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/purchases`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const totalKeys = productsRes.data.reduce((sum, p) => {
        return sum + (p.variants?.reduce((vSum, v) => vSum + v.total_keys, 0) || 0);
      }, 0);

      setStats({
        mods: productsRes.data.length,
        keys: totalKeys,
        users: usersRes.data.length,
        sold: purchasesRes.data.length
      });
      
      setRecentMods(productsRes.data.slice(0, 5));
      setRecentUsers(usersRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div>
      <h2 className="page-heading">Dashboard Overview</h2>
      
      <div className="dashboard-cards">
        <div className="dash-card purple">
          <div className="dash-icon">
            <WrenchIcon size={32} />
          </div>
          <div className="dash-value">{stats.mods}</div>
          <div className="dash-label">Total Mods</div>
        </div>
        
        <div className="dash-card green">
          <div className="dash-icon">
            <KeyIcon size={32} />
          </div>
          <div className="dash-value">{stats.keys}</div>
          <div className="dash-label">License Keys</div>
        </div>
        
        <div className="dash-card blue">
          <div className="dash-icon">
            <UsersIcon size={32} />
          </div>
          <div className="dash-value">{stats.users}</div>
          <div className="dash-label">Total Users</div>
        </div>
        
        <div className="dash-card orange">
          <div className="dash-icon">
            <KeyIcon size={32} />
          </div>
          <div className="dash-value">{stats.sold}</div>
          <div className="dash-label">Sold Licenses</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section-half">
          <div className="section-card">
            <div className="section-header-purple">
              <WrenchIcon size={20} />
              <span>Recent Mods</span>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Upload Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMods.map(mod => (
                    <tr key={mod.id}>
                      <td>{mod.name}</td>
                      <td>{new Date().toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {recentMods.length === 0 && (
                    <tr><td colSpan="2" style={{textAlign: 'center', color: '#94a3b8'}}>No mods yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="section-half">
          <div className="section-card">
            <div className="section-header-blue">
              <UsersIcon size={20} />
              <span>Recent Users</span>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Join Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{new Date().toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {recentUsers.length === 0 && (
                    <tr><td colSpan="2" style={{textAlign: 'center', color: '#94a3b8'}}>No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddModPage({ token }) {
  const [modName, setModName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!modName) {
      alert('Please enter mod name');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/admin/products`, 
        { name: modName, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Mod added successfully!');
      setModName('');
      setDescription('');
    } catch (error) {
      alert('Failed to add mod: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <div className="page-header-bar">
        <h2 className="page-heading-inline">
          <PlusIcon size={24} />
          Add New Mod
        </h2>
      </div>
      
      <div className="white-card">
        <div className="form-section">
          <label className="form-label">
            <WrenchIcon size={16} style={{display: 'inline', marginRight: '6px'}} />
            Mod Name
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter mod name"
            value={modName}
            onChange={(e) => setModName(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label className="form-label">
            <EditIcon size={16} style={{display: 'inline', marginRight: '6px'}} />
            Description
          </label>
          <textarea
            className="form-input"
            placeholder="Enter mod description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button className="btn-primary-new" onClick={handleSubmit}>
            <PlusIcon size={16} />
            Add Mod
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageModsPage({ token }) {
  const [mods, setMods] = useState([]);

  useEffect(() => {
    loadMods();
  }, []);

  const loadMods = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMods(response.data);
    } catch (error) {
      console.error('Failed to load mods:', error);
    }
  };

  const deleteMod = async (id) => {
    if (!confirm('Are you sure you want to delete this mod?')) return;
    
    try {
      await axios.delete(`${API_URL}/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Mod deleted successfully!');
      loadMods();
    } catch (error) {
      alert('Failed to delete mod: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <div className="page-header-bar">
        <h2 className="page-heading-inline">
          <EditIcon size={24} />
          Mod List
        </h2>
        <button className="btn-primary-new" style={{width: 'auto'}}>
          + Add New Mod
        </button>
      </div>
      
      <div className="white-card">
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mods.map(mod => (
                <tr key={mod.id}>
                  <td>{mod.id}</td>
                  <td>{mod.name}</td>
                  <td>{mod.description || 'Check By Yourself'}</td>
                  <td><span className="status-badge active">Active</span></td>
                  <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button className="icon-btn-small" title="Edit">
                        <EditIcon size={16} />
                      </button>
                      <button 
                        className="icon-btn-small" 
                        style={{color: '#dc2626'}}
                        onClick={() => deleteMod(mod.id)}
                        title="Delete"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {mods.length === 0 && (
                <tr><td colSpan="5" style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>No mods yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UploadAPKPage({ token }) {
  const [selectedMod, setSelectedMod] = useState('');
  const [apkFile, setApkFile] = useState(null);
  const [mods, setMods] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    loadMods();
    loadUploaded();
  }, []);

  const loadMods = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMods(response.data);
    } catch (error) {
      console.error('Failed to load mods:', error);
    }
  };

  const loadUploaded = () => {
    const files = [
      { name: 'Battle Loader', file: '68f5c740318D_BATTLE LOADER.apk', date: '18 Oct 2025 18:58' },
      { name: 'Bgmi Power', file: '68f5e6fbc8f4_Bgmi-Power-Loader.apk', date: '18 Oct 2025 18:57' }
    ];
    setUploadedFiles(files);
  };

  const handleUpload = () => {
    if (!selectedMod || !apkFile) {
      alert('Please select mod and APK file');
      return;
    }
    alert('APK upload feature coming soon!');
  };

  return (
    <div>
      <div className="page-header-bar">
        <h2 className="page-heading-inline">
          <UploadIcon size={24} />
          Upload Mod APK
        </h2>
      </div>
      
      <div className="white-card">
        <div className="form-section">
          <label className="form-label">Select Mod</label>
          <select 
            className="form-select"
            value={selectedMod}
            onChange={(e) => setSelectedMod(e.target.value)}
          >
            <option value="">-- Select Mod --</option>
            {mods.map(mod => (
              <option key={mod.id} value={mod.id}>{mod.name}</option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label className="form-label">Select Apk File</label>
          <input
            type="file"
            className="form-input"
            accept=".apk"
            onChange={(e) => setApkFile(e.target.files[0])}
          />
          <small className="form-hint">Choose File - No File Chosen</small>
        </div>

        <div className="form-actions">
          <button className="btn-primary-new" onClick={handleUpload}>
            <UploadIcon size={16} />
            Upload Mod APK
          </button>
        </div>
      </div>

      <div className="white-card">
        <h3 className="section-heading" style={{marginBottom: '16px'}}>
          <PackageIcon size={20} />
          Uploaded Mod APKs
        </h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Mod Name</th>
                <th>APK File</th>
                <th>Upload Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file, idx) => (
                <tr key={idx}>
                  <td>{file.name}</td>
                  <td>{file.file}</td>
                  <td>{file.date}</td>
                  <td>
                    <button className="btn-download" style={{padding: '6px 16px', fontSize: '13px'}}>
                      <DownloadIcon size={14} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function APKListPage({ token }) {
  const [mods, setMods] = useState([]);

  useEffect(() => {
    loadMods();
  }, []);

  const loadMods = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMods(response.data);
    } catch (error) {
      console.error('Failed to load mods:', error);
    }
  };

  return (
    <div>
      <div className="page-header-bar">
        <h2 className="page-heading-inline">
          <PackageIcon size={24} />
          All Mod APKs
        </h2>
        <button className="btn-primary-new" style={{width: 'auto'}}>
          + Add New Mod
        </button>
      </div>
      
      <div className="white-card">
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>APK File</th>
                <th>Upload Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mods.map(mod => (
                <tr key={mod.id}>
                  <td>{mod.id}</td>
                  <td>{mod.name}</td>
                  <td>{mod.description || 'Check By Yourself'}</td>
                  <td>
                    <button className="btn-view-all" style={{padding: '4px 12px', fontSize: '12px'}}>
                      ↓ Download
                    </button>
                  </td>
                  <td>{new Date().toLocaleDateString()}</td>
                  <td><span className="status-badge active">Active</span></td>
                  <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button className="icon-btn-small">
                        <EditIcon size={16} />
                      </button>
                      <button className="icon-btn-small" style={{color: '#dc2626'}}>
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {mods.length === 0 && (
                <tr><td colSpan="7" style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>No APKs yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AddLicensePage({ token }) {
  const [tabType, setTabType] = useState('single');
  const [selectedMod, setSelectedMod] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [bulkKeys, setBulkKeys] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('Hours');
  const [price, setPrice] = useState('');
  const [mods, setMods] = useState([]);

  useEffect(() => {
    loadMods();
  }, []);

  const loadMods = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMods(response.data);
    } catch (error) {
      console.error('Failed to load mods:', error);
    }
  };

  const handleAddLicense = async () => {
    if (!selectedMod || !duration || !price) {
      alert('Please fill all required fields');
      return;
    }

    const keys = tabType === 'single' ? [licenseKey] : bulkKeys.split('\n').filter(k => k.trim());
    
    if (keys.length === 0 || (tabType === 'single' && !licenseKey)) {
      alert('Please enter license key(s)');
      return;
    }

    try {
      await axios.post(`${API_URL}/admin/variants`, {
        product_id: parseInt(selectedMod),
        duration_value: parseInt(duration),
        duration_unit: durationUnit,
        price: parseFloat(price),
        keys: keys
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('License key(s) added successfully!');
      setLicenseKey('');
      setBulkKeys('');
      setDuration('');
      setPrice('');
    } catch (error) {
      alert('Failed to add license: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <div className="page-header-bar">
        <h2 className="page-heading-inline">
          <KeyIcon size={24} />
          Add License Key(s)
        </h2>
      </div>
      
      <div className="white-card">
        <div className="form-section">
          <div style={{display: 'flex', gap: '12px', marginBottom: '20px'}}>
            <button 
              className={tabType === 'single' ? 'btn-primary-new' : 'btn-view-all'}
              onClick={() => setTabType('single')}
              style={{flex: 1}}
            >
              Single Key
            </button>
            <button 
              className={tabType === 'bulk' ? 'btn-primary-new' : 'btn-view-all'}
              onClick={() => setTabType('bulk')}
              style={{flex: 1}}
            >
              Bulk Keys
            </button>
          </div>

          <label className="form-label">Select Mod</label>
          <select 
            className="form-select"
            value={selectedMod}
            onChange={(e) => setSelectedMod(e.target.value)}
          >
            <option value="">-- Select Mod --</option>
            {mods.map(mod => (
              <option key={mod.id} value={mod.id}>{mod.name}</option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label className="form-label">
            {tabType === 'single' ? 'License Key' : 'License Keys (One per line)'}
          </label>
          {tabType === 'single' ? (
            <input
              type="text"
              className="form-input"
              placeholder="Enter license key"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
            />
          ) : (
            <textarea
              className="form-input"
              placeholder="Paste license keys here, one per line"
              value={bulkKeys}
              onChange={(e) => setBulkKeys(e.target.value)}
              rows={6}
            />
          )}
          {tabType === 'bulk' && (
            <small className="form-hint">Enter one license key per line. Blank lines will be ignored.</small>
          )}
        </div>

        <div className="form-section">
          <label className="form-label">Duration</label>
          <div style={{display: 'flex', gap: '12px'}}>
            <input
              type="number"
              className="form-input"
              placeholder="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{flex: 1}}
            />
            <select 
              className="form-select"
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value)}
              style={{flex: 1}}
            >
              <option value="Hours">Hours</option>
              <option value="Days">Days</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">Price (INR)</label>
          <input
            type="number"
            className="form-input"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button className="btn-primary-new" onClick={handleAddLicense}>
            <KeyIcon size={16} />
            {tabType === 'single' ? 'Add License Key' : 'Add License Keys'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LicenseListPage({ token }) {
  const [licenses, setLicenses] = useState([]);
  const [filterMod, setFilterMod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [mods, setMods] = useState([]);

  useEffect(() => {
    loadMods();
    loadLicenses();
  }, []);

  const loadMods = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMods(response.data);
    } catch (error) {
      console.error('Failed to load mods:', error);
    }
  };

  const loadLicenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLicenses(response.data);
    } catch (error) {
      console.error('Failed to load licenses:', error);
    }
  };

  const deleteLicense = async (id) => {
    if (!confirm('Are you sure you want to delete this license?')) return;
    
    try {
      await axios.delete(`${API_URL}/admin/purchases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('License deleted successfully!');
      loadLicenses();
    } catch (error) {
      alert('Failed to delete license');
    }
  };

  return (
    <div>
      <div className="page-header-bar">
        <h2 className="page-heading-inline">
          <KeyIcon size={24} />
          License Key List
        </h2>
      </div>

      <div className="white-card" style={{marginBottom: '16px'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
          <div className="form-section" style={{marginBottom: 0}}>
            <label className="form-label">Filter by Mod:</label>
            <select className="form-select" value={filterMod} onChange={(e) => setFilterMod(e.target.value)}>
              <option value="">All Mods</option>
              {mods.map(mod => (
                <option key={mod.id} value={mod.id}>{mod.name}</option>
              ))}
            </select>
          </div>
          <div className="form-section" style={{marginBottom: 0}}>
            <label className="form-label">Filter by Status:</label>
            <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="used">Used</option>
            </select>
          </div>
          <div className="form-section" style={{marginBottom: 0}}>
            <label className="form-label">Search License Key or Mod</label>
            <input type="text" className="form-input" placeholder="Search..." />
          </div>
        </div>
        <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
          <button className="btn-primary-new" style={{flex: 1}}>Apply</button>
          <button className="btn-view-all" style={{flex: 1, borderColor: '#dc2626', color: '#dc2626'}}>Reset</button>
        </div>
      </div>
      
      <div className="white-card">
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Mod Name</th>
                <th>License Key</th>
                <th>Duration</th>
                <th>Price (INR)</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map(license => (
                <tr key={license.id}>
                  <td>{license.id}</td>
                  <td>{license.product_name}</td>
                  <td>{license.key_value}</td>
                  <td>{license.duration_value} {license.duration_unit}</td>
                  <td>₹{license.amount}</td>
                  <td><span className="status-badge active">Live</span></td>
                  <td>{new Date(license.purchased_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button className="icon-btn-small">
                        <EditIcon size={16} />
                      </button>
                      <button 
                        className="icon-btn-small" 
                        style={{color: '#dc2626'}}
                        onClick={() => deleteLicense(license.id)}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {licenses.length === 0 && (
                <tr><td colSpan="8" style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>No licenses yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AvailableKeysPage({ token }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  return (
    <div>
      <h2 className="page-heading">Available License Keys</h2>
      
      <div className="dashboard-cards" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
        <div className="dash-card purple" style={{padding: '20px'}}>
          <div className="dash-value" style={{fontSize: '32px'}}>{products.length}</div>
          <div className="dash-label">Total Keys</div>
        </div>
        <div className="dash-card green" style={{padding: '20px'}}>
          <div className="dash-value" style={{fontSize: '32px'}}>
            {products.reduce((sum, p) => sum + (p.variants?.reduce((vSum, v) => vSum + v.available_keys, 0) || 0), 0)}
          </div>
          <div className="dash-label">Available Keys</div>
        </div>
        <div className="dash-card orange" style={{padding: '20px'}}>
          <div className="dash-value" style={{fontSize: '32px'}}>
            {products.reduce((sum, p) => sum + (p.variants?.reduce((vSum, v) => vSum + (v.total_keys - v.available_keys), 0) || 0), 0)}
          </div>
          <div className="dash-label">Sold Keys</div>
        </div>
      </div>

      {products.map(product => (
        <div key={product.id} className="white-card">
          <div className="page-header-bar-sm">
            <h3 className="section-heading">{product.name}</h3>
            <div style={{display: 'flex', gap: '8px'}}>
              <span className="badge-purchase" style={{background: '#dbeafe', padding: '6px 12px'}}>
                Total: {product.variants?.reduce((sum, v) => sum + v.total_keys, 0) || 0}
              </span>
              <span className="badge-purchase" style={{background: '#d1fae5', padding: '6px 12px'}}>
                Available: {product.variants?.reduce((sum, v) => sum + v.available_keys, 0) || 0}
              </span>
              <span className="badge-purchase" style={{background: '#fee2e2', padding: '6px 12px'}}>
                Sold: {product.variants?.reduce((sum, v) => sum + (v.total_keys - v.available_keys), 0) || 0}
              </span>
            </div>
          </div>
          <p style={{color: '#64748b', marginBottom: '20px'}}>{product.description || 'Check By Yourself'}</p>
          
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Available Keys</th>
                </tr>
              </thead>
              <tbody>
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map(variant => (
                    <tr key={variant.id}>
                      <td><span className="badge-purchase" style={{background: '#dcfce7', color: '#166534'}}>{variant.duration_value} {variant.duration_unit}</span></td>
                      <td>₹{variant.price}</td>
                      <td><span className="badge-purchase" style={{background: '#d1fae5', color: '#065f46'}}>{variant.available_keys} Available</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" style={{textAlign: 'center', color: '#94a3b8'}}>No variants available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {products.length === 0 && (
        <div className="empty-state">No products available</div>
      )}
    </div>
  );
}

function ManageUsersPage({ token }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully!');
      loadUsers();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  return (
    <div>
      <div className="page-header-bar">
        <h2 className="page-heading-inline">
          <UsersIcon size={24} />
          User Management
        </h2>
        <button className="btn-primary-new" style={{width: 'auto'}}>
          + Add User
        </button>
      </div>
      
      <div className="white-card">
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Balance</th>
                <th>Role</th>
                <th>Join Date</th>
                <th>Reset Limit (24h)</th>
                <th>Usage (24h)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>test@example.com</td>
                  <td>₹{u.balance.toFixed(2)}</td>
                  <td><span className="status-badge active">{u.is_admin ? 'Admin' : 'User'}</span></td>
                  <td>{new Date().toLocaleDateString()}</td>
                  <td><button className="btn-view-all" style={{padding: '4px 12px', fontSize: '12px'}}>Send</button></td>
                  <td>0 / 1 Rolling Window</td>
                  <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button className="icon-btn-small">
                        <EditIcon size={16} />
                      </button>
                      <button 
                        className="icon-btn-small" 
                        style={{color: '#dc2626'}}
                        onClick={() => deleteUser(u.id)}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="9" style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>No users yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AddBalancePage({ token }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleAddBalance = async () => {
    if (!selectedUser || !amount) {
      alert('Please select user and enter amount');
      return;
    }

    try {
      await axios.post(`${API_URL}/admin/users/${selectedUser}/balance`, {
        amount: parseFloat(amount),
        reference: reference || 'Balance addition'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Balance added successfully!');
      setAmount('');
      setReference('');
    } catch (error) {
      alert('Failed to add balance: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <div className="page-header-bar">
        <h2 className="page-heading-inline">
          <WalletIcon size={24} />
          Add User Balance
        </h2>
      </div>
      
      <div className="white-card">
        <div className="form-section">
          <label className="form-label">Select User</label>
          <select 
            className="form-select"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">-- Select User --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username} (Current: ₹{u.balance})</option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label className="form-label">Amount (₹)</label>
          <input
            type="number"
            className="form-input"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label className="form-label">Reference (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Balance addition"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button className="btn-primary-new" onClick={handleAddBalance}>
            <WalletIcon size={16} />
            Add Balance
          </button>
        </div>
      </div>
    </div>
  );
}

function TransactionPage({ token }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  return (
    <div>
      <div className="page-header-bar">
        <h2 className="page-heading-inline">
          <HistoryIcon size={24} />
          Transaction History
        </h2>
      </div>

      <div className="white-card" style={{marginBottom: '16px'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
          <div className="form-section" style={{marginBottom: 0}}>
            <label className="form-label">Filter by User:</label>
            <select className="form-select">
              <option value="">All Users</option>
            </select>
          </div>
          <div className="form-section" style={{marginBottom: 0}}>
            <label className="form-label">Filter by Type:</label>
            <select className="form-select">
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div className="form-section" style={{marginBottom: 0}}>
            <label className="form-label">Filter by Status:</label>
            <select className="form-select">
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="form-section" style={{marginBottom: 0}}>
            <label className="form-label">Search Reference or User</label>
            <input type="text" className="form-input" placeholder="Search..." />
          </div>
        </div>
        <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
          <button className="btn-primary-new" style={{flex: 1}}>Apply Filters</button>
          <button className="btn-view-all" style={{flex: 1, borderColor: '#dc2626', color: '#dc2626'}}>Reset Filters</button>
        </div>
      </div>
      
      <div className="white-card">
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Amount (₹)</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.username || 'Unknown'}</td>
                  <td className="amount-debit">-₹{t.amount}</td>
                  <td><span className="badge-purchase">Purchase</span></td>
                  <td>License purchase #{t.id}</td>
                  <td><span className="status-badge completed">Completed</span></td>
                  <td>{new Date(t.purchased_at).toLocaleString()}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan="7" style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReferralPage({ token }) {
  const [expiryDays, setExpiryDays] = useState('30');
  const [referrals, setReferrals] = useState([
    { code: '1EA25928', user: 'ishashwat', created: '03 Nov 2025 11:35', expires: '18 Nov 2025 10:35', status: 'Active' },
    { code: 'C7035A5C', user: 'ishashwat', created: '03 Nov 2025 11:26', expires: '18 Nov 2025 10:26', status: 'Active' }
  ]);

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    alert(`Generated referral code: ${code}`);
  };

  const deactivateCode = (code) => {
    if (confirm(`Deactivate referral code ${code}?`)) {
      alert('Referral code deactivated!');
    }
  };

  return (
    <div>
      <div className="page-header-bar">
        <h2 className="page-heading-inline">
          <GiftIcon size={24} />
          Generate Referral Code
        </h2>
      </div>
      
      <div className="white-card">
        <div className="form-section">
          <label className="form-label">Expiry Days</label>
          <select 
            className="form-select"
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
          >
            <option value="7">7 Days</option>
            <option value="15">15 Days</option>
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
            <option value="90">90 Days</option>
          </select>
        </div>

        <div className="form-actions">
          <button className="btn-primary-new" onClick={generateCode}>
            <GiftIcon size={16} />
            Generate Code
          </button>
        </div>
      </div>

      <div className="white-card">
        <h3 className="section-heading" style={{marginBottom: '16px'}}>
          <GiftIcon size={20} />
          All Referral Codes
        </h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Referral Code</th>
                <th>Generated By</th>
                <th>Created At</th>
                <th>Expires At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref, idx) => (
                <tr key={idx}>
                  <td><strong>{ref.code}</strong></td>
                  <td>{ref.user}</td>
                  <td>{ref.created}</td>
                  <td>{ref.expires}</td>
                  <td><span className="status-badge active">{ref.status}</span></td>
                  <td>
                    <button 
                      className="btn-view-all" 
                      style={{padding: '4px 12px', fontSize: '12px', borderColor: '#f59e0b', color: '#f59e0b'}}
                      onClick={() => deactivateCode(ref.code)}
                    >
                      Deactivate
                    </button>
                    <button 
                      className="icon-btn-small" 
                      style={{color: '#dc2626', marginLeft: '8px'}}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ user, token }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    alert('Change password feature coming soon!');
  };

  return (
    <div>
      <h2 className="page-heading">Account Settings</h2>
      
      <div className="settings-row">
        <div className="settings-col">
          <div className="white-card">
            <div className="page-header-bar-sm">
              <h3 className="section-heading">
                <UserIcon size={20} />
                Account Information
              </h3>
            </div>
            
            <div className="form-section">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={user.username}
                readOnly
              />
            </div>

            <div className="form-section">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value="somysam29@gmail.com"
                readOnly
              />
            </div>

            <div className="form-section">
              <label className="form-label">Role</label>
              <input
                type="text"
                className="form-input"
                value="Admin"
                readOnly
              />
            </div>

            <div className="form-section">
              <label className="form-label">Join Date</label>
              <input
                type="text"
                className="form-input"
                value="05 Aug 2025 18:10"
                readOnly
              />
            </div>

            <div className="form-actions">
              <button className="btn-primary-new">
                Update Details
              </button>
            </div>
          </div>
        </div>

        <div className="settings-col">
          <div className="white-card">
            <div className="page-header-bar-sm">
              <h3 className="section-heading">
                <LockIcon size={20} />
                Change Password
              </h3>
            </div>
            
            <div className="form-section">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-section">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button className="btn-primary-new" onClick={handleChangePassword}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
