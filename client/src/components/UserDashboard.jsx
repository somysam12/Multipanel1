import { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardIcon, ShoppingCartIcon, KeyIcon, WalletIcon, UserIcon, MenuIcon, CloseIcon, CopyIcon, FilterIcon, WrenchIcon, ChevronDownIcon, LockIcon, LogoutIcon, HistoryIcon } from './Icons';

const API_URL = '/api';

function UserDashboard({ user, token, onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balance, setBalance] = useState(user.balance);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [walletHistory, setWalletHistory] = useState({ moneyAdded: 0, moneyUsed: 0, netBalance: 0 });

  useEffect(() => {
    loadProfile();
    loadProducts();
    loadPurchases();
    loadWalletHistory();
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

  const loadWalletHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/wallet-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWalletHistory(response.data);
    } catch (error) {
      console.error('Failed to load wallet history:', error);
    }
  };

  const buyProduct = async () => {
    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }

    if (!confirm(`Purchase ${selectedProduct.name} for ₹${selectedProduct.price}?`)) return;

    try {
      const response = await axios.post(`${API_URL}/purchase/${selectedProduct.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Purchase successful! Your key: ${response.data.key}`);
      setBalance(response.data.newBalance);
      loadPurchases();
      loadProducts();
      loadWalletHistory();
      setSelectedProduct(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Purchase failed');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="user-panel">
      <div className="panel-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <MenuIcon size={24} />
          </button>
          <div className="panel-logo">
            <span className="logo-icon"><WrenchIcon size={24} /></span>
            <h1 className="panel-title">MULTIHACK PANEL</h1>
          </div>
        </div>
        <div className="user-dropdown">
          <button className="user-menu-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <UserIcon size={20} /> {user.username.toUpperCase()} <ChevronDownIcon size={16} />
          </button>
          {dropdownOpen && (
            <>
              <div className="overlay" onClick={() => setDropdownOpen(false)}></div>
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-user">{user.username.toUpperCase()}</div>
                  <div className="dropdown-role">Reseller</div>
                </div>
                <div className="dropdown-balance">
                  <WalletIcon size={20} />
                  <div>
                    <div style={{fontSize: '12px', opacity: 0.8}}>Wallet Balance</div>
                    <div className="balance-amount">₹{balance.toFixed(2)}</div>
                  </div>
                </div>
                <div className="dropdown-section">
                  <div className="section-title">Wallet</div>
                  <div className="dropdown-item" onClick={() => { setCurrentPage('wallet'); setDropdownOpen(false); }}>
                    <HistoryIcon size={16} /> Wallet History
                  </div>
                </div>
                <div className="dropdown-section">
                  <div className="section-title">Account</div>
                  <div className="dropdown-item" onClick={() => alert('Change password feature coming soon!')}>
                    <LockIcon size={16} /> Change Password
                  </div>
                  <div className="dropdown-item" onClick={onLogout}>
                    <LogoutIcon size={16} /> Logout
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {sidebarOpen && (
        <>
          <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
          <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h2 className="panel-title">Menu</h2>
              <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
                <CloseIcon size={24} />
              </button>
            </div>
            <div className="sidebar-nav">
              <div 
                className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setCurrentPage('dashboard'); setSidebarOpen(false); }}
              >
                <span className="nav-icon"><DashboardIcon size={20} /></span>
                Dashboard
              </div>
              <div 
                className={`nav-item ${currentPage === 'buy' ? 'active' : ''}`}
                onClick={() => { setCurrentPage('buy'); setSidebarOpen(false); }}
              >
                <span className="nav-icon"><ShoppingCartIcon size={20} /></span>
                Buy Key
              </div>
              <div 
                className={`nav-item ${currentPage === 'keys' ? 'active' : ''}`}
                onClick={() => { setCurrentPage('keys'); setSidebarOpen(false); }}
              >
                <span className="nav-icon"><KeyIcon size={20} /></span>
                My Keys
              </div>
              <div 
                className={`nav-item ${currentPage === 'wallet' ? 'active' : ''}`}
                onClick={() => { setCurrentPage('wallet'); setSidebarOpen(false); }}
              >
                <span className="nav-icon"><WalletIcon size={20} /></span>
                Wallet History
              </div>
            </div>
          </div>
        </>
      )}

      <div className="panel-content">
        {currentPage === 'dashboard' && (
          <div>
            <h2 className="welcome-message">Welcome,<br/>{user.username.toUpperCase()}</h2>
            
            <div className="stats-grid">
              <div className="card card-primary">
                <div className="card-title">Current Balance</div>
                <div className="card-value">₹{balance.toFixed(2)}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">My Keys</div>
              <div className="card-value" style={{fontSize: '48px'}}>{purchases.length}</div>
            </div>

            <div className="card">
              <h3 style={{marginBottom: '20px', fontSize: '18px'}}>Recent Keys</h3>
              {purchases.length === 0 ? (
                <p style={{color: '#94a3b8', textAlign: 'center', padding: '40px'}}>No keys purchased yet</p>
              ) : (
                <div className="keys-list">
                  {purchases.slice(0, 3).map(purchase => (
                    <div key={purchase.id} className="key-card">
                      <div style={{marginBottom: '12px'}}>
                        <div style={{fontSize: '12px', color: '#94a3b8'}}>somysam29@gmail.com</div>
                        <div style={{fontSize: '14px', color: '#cbd5e1', marginTop: '4px'}}>
                          {purchase.product_name} ({purchase.duration})
                        </div>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
                        <span style={{color: '#94a3b8'}}>
                          {new Date(purchase.purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === 'buy' && (
          <div>
            <h2 className="page-title">Buy Keys</h2>
            
            <div className="card card-primary" style={{marginBottom: '24px'}}>
              <div className="card-title">Your Wallet Balance</div>
              <div className="card-value">₹{balance.toFixed(2)}</div>
            </div>

            <div className="card">
              <div className="form-group">
                <label>Product</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for a product"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{marginBottom: '8px'}}
                />
                {searchQuery && (
                  <div className="product-list">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className={`product-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedProduct(product); setSearchQuery(product.name); }}
                      >
                        {product.name}
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="product-item" style={{color: '#94a3b8'}}>No products found</div>
                    )}
                  </div>
                )}
              </div>

              {selectedProduct && (
                <>
                  <div className="form-group">
                    <label>Duration</label>
                    <select className="form-group input" disabled style={{opacity: 0.7}}>
                      <option>{selectedProduct.duration}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                    />
                    <small style={{color: '#94a3b8', display: 'block', marginTop: '8px'}}>
                      Enter the number of license keys you want to generate (max 100)
                    </small>
                  </div>

                  <div style={{marginTop: '24px', display: 'flex', gap: '12px'}}>
                    <button className="btn btn-blue" onClick={buyProduct} style={{flex: 1}}>
                      Buy Keys
                    </button>
                    <button className="btn btn-cancel" onClick={() => { setSelectedProduct(null); setSearchQuery(''); }} style={{flex: 1}}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {currentPage === 'keys' && (
          <div>
            <h2 className="page-title">My Keys</h2>
            
            <div className="card">
              <div className="card-title">My Keys</div>
              <div className="card-value" style={{fontSize: '48px', marginBottom: '24px'}}>{purchases.length}</div>
            </div>

            <div className="card">
              <h3 style={{marginBottom: '20px', fontSize: '18px'}}>Recent Keys</h3>
              {purchases.length === 0 ? (
                <p style={{color: '#94a3b8', textAlign: 'center', padding: '40px'}}>No keys purchased yet</p>
              ) : (
                <div className="keys-list">
                  {purchases.map(purchase => (
                    <div key={purchase.id} className="key-card">
                      <div className="key-header">
                        <div>
                          <div className="key-product">{purchase.product_name}</div>
                          <div style={{fontSize: '12px', color: '#94a3b8', marginTop: '4px'}}>
                            Duration: {purchase.duration}
                          </div>
                        </div>
                        <div className="key-date">
                          {new Date(purchase.purchased_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="key-detail">
                        <span className="key-label">Customer</span>
                        <span className="key-value">somysam29@gmail.com</span>
                      </div>
                      
                      <div className="key-detail">
                        <span className="key-label">Key</span>
                        <div className="key-code">
                          <span>{purchase.key_value}</span>
                          <button className="copy-btn" onClick={() => copyToClipboard(purchase.key_value)}>
                            <CopyIcon size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="key-detail">
                        <span className="key-label">Purchased</span>
                        <span className="key-value">
                          {new Date(purchase.purchased_at).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric', year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === 'wallet' && (
          <div>
            <h2 className="page-title">Wallet History</h2>
            
            <button className="btn btn-blue" style={{marginBottom: '24px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
              <FilterIcon size={16} /> Filter Transactions
            </button>

            <div className="stats-grid">
              <div className="card card-success">
                <div className="card-title">Money Added</div>
                <div className="card-value">₹{walletHistory.moneyAdded.toFixed(2)}</div>
              </div>

              <div className="card card-danger">
                <div className="card-title">Money Used</div>
                <div className="card-value">
                  ₹{walletHistory.moneyUsed.toFixed(2)}
                </div>
              </div>

              <div className="card card-primary">
                <div className="card-title">Net Balance</div>
                <div className="card-value">₹{walletHistory.netBalance.toFixed(2)}</div>
              </div>
            </div>

            <div className="card">
              <h3 style={{marginBottom: '20px', fontSize: '18px'}}>Recent Transactions</h3>
              {purchases.length === 0 ? (
                <p style={{color: '#94a3b8', textAlign: 'center', padding: '40px'}}>No transactions yet</p>
              ) : (
                <div>
                  {purchases.map(purchase => (
                    <div key={purchase.id} className="transaction-card">
                      <div className="transaction-header">
                        <div className="transaction-date">
                          {new Date(purchase.purchased_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <span className="transaction-type type-debit">DEBIT</span>
                      </div>
                      <div style={{fontSize: '14px', color: '#cbd5e1'}}>
                        Purchased: {purchase.product_name}
                      </div>
                      <div style={{fontSize: '18px', fontWeight: '700', marginTop: '8px', color: '#fca5a5'}}>
                        -₹{parseFloat(purchase.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '12px'}}>
        © 2025 MULTIHACK PANEL. All rights reserved.
      </div>
    </div>
  );
}

export default UserDashboard;
