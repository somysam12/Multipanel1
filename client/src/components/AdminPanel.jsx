import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { DashboardIcon, UsersIcon, PackageIcon, GiftIcon, MenuIcon, CloseIcon, UserIcon, ChevronDownIcon, LogoutIcon, WalletIcon, SearchIcon, PlusIcon, TrashIcon, EditIcon, LockIcon, WrenchIcon, KeyIcon } from './Icons';

const API_URL = '/api';

function AdminPanel({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin' || path === '/admin/users') {
      return location.pathname === '/admin' || location.pathname === '/admin/' || location.pathname === '/admin/users';
    }
    return location.pathname === path;
  };

  return (
    <div className="user-panel">
      <div className="panel-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <MenuIcon size={24} />
          </button>
          <div className="panel-logo">
            <span className="logo-icon"><WrenchIcon size={24} /></span>
            <h1 className="panel-title">MULTIHACK PANEL - ADMIN</h1>
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
                  <div className="dropdown-role">Administrator</div>
                </div>
                <div className="dropdown-section">
                  <div className="section-title">Account</div>
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
              <Link 
                to="/admin/users"
                className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon"><UsersIcon size={20} /></span>
                User Management
              </Link>
              <Link 
                to="/admin/products"
                className={`nav-item ${isActive('/admin/products') ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon"><PackageIcon size={20} /></span>
                Product Management
              </Link>
              <Link 
                to="/admin/referrals"
                className={`nav-item ${isActive('/admin/referrals') ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon"><GiftIcon size={20} /></span>
                Referral Management
              </Link>
            </div>
          </div>
        </>
      )}

      <div className="panel-content">
        <Routes>
          <Route index element={<UsersManager />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="products" element={<ProductsManager />} />
          <Route path="referrals" element={<ReferralsManager />} />
        </Routes>
      </div>

      <div style={{textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '12px'}}>
        © 2025 MULTIHACK PANEL. All rights reserved.
      </div>
    </div>
  );
}

function UsersManager() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', balance: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [purchases, setPurchases] = useState([]);

  const token = localStorage.getItem('token');

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

  const searchUsers = async () => {
    if (!searchQuery) {
      loadUsers();
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/admin/users/search/${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateForm(false);
      setNewUser({ username: '', password: '', balance: 0 });
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create user');
    }
  };

  const updateBalance = async (userId, balance) => {
    try {
      await axios.put(`${API_URL}/admin/users/${userId}/balance`, { balance }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadUsers();
    } catch (error) {
      alert('Failed to update balance');
    }
  };

  const toggleBlock = async (userId, isBlocked) => {
    try {
      await axios.put(`${API_URL}/admin/users/${userId}/block`, { blocked: !isBlocked }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadUsers();
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const viewPurchases = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/admin/users/${userId}/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchases(response.data);
      setSelectedUser(userId);
    } catch (error) {
      alert('Failed to load purchases');
    }
  };

  return (
    <div>
      <h2 className="page-title">User Management</h2>
      
      <div className="card" style={{marginBottom: '24px'}}>
        <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
          <div style={{flex: '1', minWidth: '250px', display: 'flex', gap: '8px'}}>
            <div style={{flex: 1, position: 'relative'}}>
              <SearchIcon size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}} />
              <input
                type="text"
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{width: '100%', paddingLeft: '40px', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0'}}
              />
            </div>
            <button onClick={searchUsers} className="btn btn-blue" style={{whiteSpace: 'nowrap'}}>
              <SearchIcon size={16} /> Search
            </button>
          </div>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-blue" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <PlusIcon size={16} /> Create User
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={createUser} style={{marginTop: '20px', padding: '20px', background: '#0f172a', borderRadius: '8px', display: 'grid', gap: '16px'}}>
            <div className="form-group" style={{marginBottom: 0}}>
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                required
              />
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
              />
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label>Initial Balance</label>
              <input
                type="number"
                placeholder="0.00"
                value={newUser.balance}
                onChange={(e) => setNewUser({...newUser, balance: parseFloat(e.target.value)})}
              />
            </div>
            <div style={{display: 'flex', gap: '12px'}}>
              <button type="submit" className="btn btn-blue" style={{flex: 1}}>Create</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-cancel" style={{flex: 1}}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Balance</th>
                <th>Referral Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><UserIcon size={16} /> {user.username}</div></td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <WalletIcon size={16} style={{color: '#94a3b8'}} />
                      <input
                        type="number"
                        value={user.balance}
                        onChange={(e) => updateBalance(user.id, parseFloat(e.target.value))}
                        style={{width: '100px', padding: '6px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#e2e8f0'}}
                      />
                    </div>
                  </td>
                  <td>{user.referred_by || '-'}</td>
                  <td>
                    <span className={`status-badge ${user.is_blocked ? 'status-blocked' : 'status-active'}`}>
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                      <button 
                        onClick={() => toggleBlock(user.id, user.is_blocked)}
                        className={`btn-small ${user.is_blocked ? 'btn-success' : 'btn-danger'}`}
                      >
                        <LockIcon size={14} /> {user.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                      <button onClick={() => viewPurchases(user.id)} className="btn-small btn-info">
                        <KeyIcon size={14} /> Purchases
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="modal">
          <div className="modal-content admin-modal">
            <button onClick={() => setSelectedUser(null)} className="modal-close-btn">
              <CloseIcon size={20} />
            </button>
            <h3 style={{marginBottom: '24px', fontSize: '20px', color: '#e2e8f0'}}>Purchase History</h3>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Key</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map(purchase => (
                    <tr key={purchase.id}>
                      <td>{purchase.product_name}</td>
                      <td><code style={{background: '#0f172a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>{purchase.key_value}</code></td>
                      <td><WalletIcon size={14} style={{display: 'inline', marginRight: '4px'}} />₹{purchase.amount}</td>
                      <td>{new Date(purchase.purchased_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, duration: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [keys, setKeys] = useState([]);
  const [newKeys, setNewKeys] = useState('');

  const token = localStorage.getItem('token');

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

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/products`, newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateForm(false);
      setNewProduct({ name: '', description: '', price: 0, duration: '' });
      loadProducts();
    } catch (error) {
      alert('Failed to create product');
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure? This will delete all keys for this product.')) return;
    try {
      await axios.delete(`${API_URL}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadProducts();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const loadKeys = async (productId) => {
    try {
      const response = await axios.get(`${API_URL}/admin/products/${productId}/keys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKeys(response.data);
      setSelectedProduct(productId);
    } catch (error) {
      alert('Failed to load keys');
    }
  };

  const addKeys = async (e) => {
    e.preventDefault();
    const keyArray = newKeys.split('\n').filter(k => k.trim());
    if (keyArray.length === 0) return;

    try {
      await axios.post(`${API_URL}/admin/products/${selectedProduct}/keys`, 
        { keys: keyArray }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewKeys('');
      loadKeys(selectedProduct);
    } catch (error) {
      alert('Failed to add keys');
    }
  };

  const deleteKey = async (keyId) => {
    try {
      await axios.delete(`${API_URL}/admin/products/${selectedProduct}/keys/${keyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadKeys(selectedProduct);
    } catch (error) {
      alert('Failed to delete key');
    }
  };

  const deleteAllKeys = async () => {
    if (!confirm('Delete all keys for this product?')) return;
    try {
      await axios.delete(`${API_URL}/admin/products/${selectedProduct}/keys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadKeys(selectedProduct);
    } catch (error) {
      alert('Failed to delete keys');
    }
  };

  return (
    <div>
      <h2 className="page-title">Product Management</h2>
      
      <div className="card" style={{marginBottom: '24px'}}>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-blue" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <PlusIcon size={16} /> Add Product
        </button>

        {showCreateForm && (
          <form onSubmit={createProduct} style={{marginTop: '20px', padding: '20px', background: '#0f172a', borderRadius: '8px', display: 'grid', gap: '16px'}}>
            <div className="form-group" style={{marginBottom: 0}}>
              <label>Product Name</label>
              <input
                type="text"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label>Description</label>
              <textarea
                placeholder="Enter description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                style={{width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', minHeight: '80px', fontFamily: 'inherit'}}
              />
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label>Price</label>
              <input
                type="number"
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label>Duration</label>
              <input
                type="text"
                placeholder="e.g., 1 month, 1 year"
                value={newProduct.duration}
                onChange={(e) => setNewProduct({...newProduct, duration: e.target.value})}
                required
              />
            </div>
            <div style={{display: 'flex', gap: '12px'}}>
              <button type="submit" className="btn btn-blue" style={{flex: 1}}>Create Product</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-cancel" style={{flex: 1}}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Available Keys</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><PackageIcon size={16} /> {product.name}</div></td>
                  <td>{product.description}</td>
                  <td><WalletIcon size={14} style={{display: 'inline', marginRight: '4px'}} />₹{product.price}</td>
                  <td>{product.duration}</td>
                  <td><span className="status-badge status-active">{product.availableKeys}</span></td>
                  <td>
                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                      <button onClick={() => loadKeys(product.id)} className="btn-small btn-info">
                        <EditIcon size={14} /> Manage Keys
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="btn-small btn-danger">
                        <TrashIcon size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct && (
        <div className="modal">
          <div className="modal-content admin-modal">
            <button onClick={() => setSelectedProduct(null)} className="modal-close-btn">
              <CloseIcon size={20} />
            </button>
            <h3 style={{marginBottom: '24px', fontSize: '20px', color: '#e2e8f0'}}>Product Keys Management</h3>
            
            <form onSubmit={addKeys} style={{marginBottom: '24px'}}>
              <div className="form-group" style={{marginBottom: '12px'}}>
                <label>Add Keys (one per line)</label>
                <textarea
                  placeholder="Enter keys, one per line..."
                  value={newKeys}
                  onChange={(e) => setNewKeys(e.target.value)}
                  rows="5"
                  style={{width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '13px'}}
                />
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button type="submit" className="btn btn-blue" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                  <PlusIcon size={16} /> Add Keys
                </button>
                <button type="button" onClick={deleteAllKeys} className="btn-small btn-danger">
                  <TrashIcon size={14} /> Delete All
                </button>
              </div>
            </form>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map(key => (
                    <tr key={key.id}>
                      <td><code style={{background: '#0f172a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>{key.key_value}</code></td>
                      <td>
                        <span className={`status-badge ${key.is_used ? 'status-used' : 'status-available'}`}>
                          {key.is_used ? 'Used' : 'Available'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => deleteKey(key.id)} className="btn-small btn-danger">
                          <TrashIcon size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReferralsManager() {
  const [referrals, setReferrals] = useState([]);
  const [newBalance, setNewBalance] = useState(0);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/referrals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferrals(response.data);
    } catch (error) {
      console.error('Failed to load referrals:', error);
    }
  };

  const createReferral = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/admin/referrals`, 
        { balance: newBalance }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Referral created: ${response.data.code}`);
      setNewBalance(0);
      loadReferrals();
    } catch (error) {
      alert('Failed to create referral');
    }
  };

  return (
    <div>
      <h2 className="page-title">Referral Management</h2>
      
      <div className="card" style={{marginBottom: '24px'}}>
        <form onSubmit={createReferral} style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end'}}>
          <div className="form-group" style={{flex: '1', minWidth: '250px', marginBottom: 0}}>
            <label>Initial Balance for New Referral</label>
            <input
              type="number"
              placeholder="0.00"
              value={newBalance}
              onChange={(e) => setNewBalance(parseFloat(e.target.value))}
              required
            />
          </div>
          <button type="submit" className="btn btn-blue" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <PlusIcon size={16} /> Generate Referral
          </button>
        </form>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Used By</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(ref => (
                <tr key={ref.id}>
                  <td><code style={{background: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '700', color: '#0ea5e9'}}>{ref.code}</code></td>
                  <td><WalletIcon size={14} style={{display: 'inline', marginRight: '4px'}} />₹{ref.balance}</td>
                  <td>
                    <span className={`status-badge ${ref.is_used ? 'status-used' : 'status-available'}`}>
                      {ref.is_used ? 'Used' : 'Available'}
                    </span>
                  </td>
                  <td>{ref.used_by_username || '-'}</td>
                  <td>{new Date(ref.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
