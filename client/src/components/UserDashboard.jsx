import { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardIcon, ShoppingCartIcon, KeyIcon, WalletIcon, UserIcon, MenuIcon, CloseIcon, CopyIcon, FilterIcon, WrenchIcon, ChevronDownIcon, LockIcon, LogoutIcon, HistoryIcon, DownloadIcon } from './Icons';

const API_URL = '/api';

function UserDashboard({ user, token, onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balance, setBalance] = useState(user.balance);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addBalanceAmount, setAddBalanceAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadProfile();
    loadProducts();
    loadPurchases();
    loadTransactions();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadPurchases = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchases(response.data);
    } catch (error) {
      console.error('Failed to load purchases:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const buyProduct = async () => {
    if (!selectedProduct || !selectedVariant) {
      alert('Please select a product and variant');
      return;
    }

    if (!confirm(`Purchase ${selectedProduct.name} (${selectedVariant.duration_value} ${selectedVariant.duration_unit}) for ₹${selectedVariant.price}?`)) return;

    try {
      const response = await axios.post(`${API_URL}/purchase/${selectedVariant.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Purchase successful! Your key: ${response.data.key}`);
      setBalance(response.data.newBalance);
      loadPurchases();
      loadProducts();
      loadTransactions();
      setSelectedProduct(null);
      setSelectedVariant(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Purchase failed');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleAddBalance = () => {
    if (!addBalanceAmount || !paymentMethod) {
      alert('Please enter amount and select payment method');
      return;
    }
    alert('Payment integration coming soon!');
  };

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
    <div className="user-panel-new">
      <div className={`sidebar-left ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header-new">
          <UserIcon size={32} />
          <h2 className="sidebar-title">User Panel</h2>
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
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
            className={`nav-item-new ${currentPage === 'manage-key' ? 'active' : ''}`}
            onClick={() => setCurrentPage('manage-key')}
          >
            <KeyIcon size={20} />
            <span>Manage Key</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'generate' ? 'active' : ''}`}
            onClick={() => setCurrentPage('generate')}
          >
            <ShoppingCartIcon size={20} />
            <span>Generate</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'balance' ? 'active' : ''}`}
            onClick={() => setCurrentPage('balance')}
          >
            <WalletIcon size={20} />
            <span>Balance</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'transaction' ? 'active' : ''}`}
            onClick={() => setCurrentPage('transaction')}
          >
            <HistoryIcon size={20} />
            <span>Transaction</span>
          </div>
          <div 
            className={`nav-item-new ${currentPage === 'applications' ? 'active' : ''}`}
            onClick={() => setCurrentPage('applications')}
          >
            <DownloadIcon size={20} />
            <span>Applications</span>
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
          <button 
            className="menu-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon size={24} />
          </button>
          <div className="header-welcome">
            Welcome, <span className="username-badge">{user.username}</span>
          </div>
        </div>

        <div className="content-area-new">
          {currentPage === 'dashboard' && (
            <div>
              <h2 className="page-heading">Dashboard Overview</h2>
              
              <div className="dashboard-cards">
                <div className="dash-card purple">
                  <div className="dash-icon">
                    <WrenchIcon size={32} />
                  </div>
                  <div className="dash-value">{products.length}</div>
                  <div className="dash-label">Total Mods</div>
                </div>
                
                <div className="dash-card green">
                  <div className="dash-icon">
                    <KeyIcon size={32} />
                  </div>
                  <div className="dash-value">{purchases.length}</div>
                  <div className="dash-label">License Keys</div>
                </div>
                
                <div className="dash-card blue">
                  <div className="dash-icon">
                    <UserIcon size={32} />
                  </div>
                  <div className="dash-value">1</div>
                  <div className="dash-label">Total Users</div>
                </div>
                
                <div className="dash-card orange">
                  <div className="dash-icon">
                    <ShoppingCartIcon size={32} />
                  </div>
                  <div className="dash-value">{purchases.length}</div>
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
                          {products.slice(0, 5).map(product => (
                            <tr key={product.id}>
                              <td>{product.name}</td>
                              <td>{new Date().toLocaleDateString()}</td>
                            </tr>
                          ))}
                          {products.length === 0 && (
                            <tr><td colSpan="2" style={{textAlign: 'center', color: '#94a3b8'}}>No mods available</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="section-half">
                  <div className="section-card">
                    <div className="section-header-blue">
                      <UserIcon size={20} />
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
                          <tr>
                            <td>{user.username}</td>
                            <td>{new Date().toLocaleDateString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'manage-key' && (
            <div>
              <div className="page-header-bar">
                <h2 className="page-heading-inline">
                  <KeyIcon size={24} />
                  Your License Keys
                </h2>
              </div>
              
              <div className="white-card">
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Mod Name</th>
                        <th>License Key</th>
                        <th>Duration</th>
                        <th>Purchase Date</th>
                        <th>Expiry Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map(purchase => {
                        const expiryDate = new Date(purchase.purchased_at);
                        expiryDate.setDate(expiryDate.getDate() + (purchase.duration_value * (purchase.duration_unit === 'Days' ? 1 : 30)));
                        
                        return (
                          <tr key={purchase.id}>
                            <td>{purchase.product_name}</td>
                            <td>
                              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span>{purchase.key_value}</span>
                                <button 
                                  className="icon-btn-small"
                                  onClick={() => copyToClipboard(purchase.key_value)}
                                  title="Copy"
                                >
                                  <CopyIcon size={14} />
                                </button>
                              </div>
                            </td>
                            <td>{purchase.duration_value} {purchase.duration_unit}</td>
                            <td>{new Date(purchase.purchased_at).toLocaleDateString()}</td>
                            <td>{expiryDate.toLocaleDateString()}</td>
                            <td>₹{purchase.amount}</td>
                            <td>
                              <span className={`status-badge ${expiryDate > new Date() ? 'active' : 'expired'}`}>
                                {expiryDate > new Date() ? 'Active' : 'Expired'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {purchases.length === 0 && (
                        <tr><td colSpan="7" style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>No license keys yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'generate' && (
            <div>
              <div className="page-header-bar">
                <h2 className="page-heading-inline">
                  <ShoppingCartIcon size={24} />
                  Purchase License Key
                </h2>
              </div>
              
              <div className="white-card">
                <div className="form-section">
                  <label className="form-label">Select Mod</label>
                  <select 
                    className="form-select"
                    value={selectedProduct?.id || ''}
                    onChange={(e) => {
                      const product = products.find(p => p.id === parseInt(e.target.value));
                      setSelectedProduct(product);
                      setSelectedVariant(null);
                    }}
                  >
                    <option value="">-- Select Mod --</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>

                {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div className="form-section">
                    <label className="form-label">Select Duration & Price</label>
                    <div className="duration-options">
                      {selectedProduct.variants.map(variant => (
                        <div
                          key={variant.id}
                          className={`duration-card ${selectedVariant?.id === variant.id ? 'selected' : ''} ${variant.available_keys === 0 ? 'disabled' : ''}`}
                          onClick={() => variant.available_keys > 0 && setSelectedVariant(variant)}
                        >
                          <div className="duration-info">
                            <div className="duration-value">{variant.duration_value} {variant.duration_unit}</div>
                            <div className="duration-stock">{variant.available_keys} Available</div>
                          </div>
                          <div className="duration-price">₹{variant.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVariant && (
                  <div className="form-actions">
                    <button className="btn-primary-new" onClick={buyProduct}>
                      Purchase for ₹{selectedVariant.price}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentPage === 'balance' && (
            <div>
              <div className="balance-display">
                <WalletIcon size={40} />
                <h2 className="balance-heading">Your Current Balance</h2>
                <div className="balance-amount-large">₹{balance.toFixed(2)}</div>
              </div>

              <div className="white-card">
                <div className="page-header-bar-sm">
                  <h3 className="section-heading">
                    <WalletIcon size={20} />
                    Add Balance
                  </h3>
                </div>

                <div className="form-section">
                  <label className="form-label">Amount (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter amount"
                    value={addBalanceAmount}
                    onChange={(e) => setAddBalanceAmount(e.target.value)}
                  />
                  <small className="form-hint">Minimum amount is ₹1</small>
                </div>

                <div className="form-section">
                  <label className="form-label">Payment Method</label>
                  <select 
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="">-- Select Payment Method --</option>
                    <option value="upi">UPI</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button className="btn-primary-new" onClick={handleAddBalance}>
                    Proceed to Payment
                  </button>
                </div>
              </div>

              <div className="white-card" style={{marginTop: '24px'}}>
                <div className="page-header-bar-sm">
                  <h3 className="section-heading">
                    <HistoryIcon size={20} />
                    Recent Transactions
                  </h3>
                  <button className="btn-view-all">View All</button>
                </div>
                <div className="empty-state">No transactions found</div>
              </div>
            </div>
          )}

          {currentPage === 'transaction' && (
            <div>
              <div className="page-header-bar">
                <h2 className="page-heading-inline">
                  <HistoryIcon size={24} />
                  Transaction History
                </h2>
                <button className="btn-back" onClick={() => setCurrentPage('balance')}>
                  ← Back to Balance
                </button>
              </div>
              
              <div className="white-card">
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Reference</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td>{new Date(transaction.purchased_at).toLocaleString()}</td>
                          <td className="amount-debit">-₹{transaction.amount}</td>
                          <td><span className="badge-purchase">Purchase</span></td>
                          <td>License purchase #{transaction.id}</td>
                          <td><span className="status-badge completed">Completed</span></td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr><td colSpan="5" style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>No transactions yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'applications' && (
            <div>
              <h2 className="page-heading">Mod APK List - Mod APK Management</h2>
              
              <div className="apps-grid">
                {products.map(product => (
                  <div key={product.id} className="app-card">
                    <h3 className="app-name">{product.name}</h3>
                    <p className="app-desc">Check By Yourself</p>
                    <button className="btn-download">
                      <DownloadIcon size={16} />
                      Download APK
                    </button>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="empty-state-full">No applications available</div>
                )}
              </div>
            </div>
          )}

          {currentPage === 'settings' && (
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
                        value={user.email || 'somysam29@gmail.com'}
                        readOnly
                      />
                    </div>

                    <div className="form-section">
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        className="form-input"
                        value={user.is_admin ? 'Admin' : 'User'}
                        readOnly
                      />
                    </div>

                    <div className="form-section">
                      <label className="form-label">Join Date</label>
                      <input
                        type="text"
                        className="form-input"
                        value={new Date().toLocaleDateString()}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
