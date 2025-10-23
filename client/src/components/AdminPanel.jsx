import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function AdminPanel({ user, onLogout }) {
  return (
    <div className="admin-container">
      <nav className="admin-nav">
        <h2>Admin Panel</h2>
        <div className="nav-links">
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/referrals">Referrals</Link>
        </div>
        <button onClick={onLogout} className="btn-logout">Logout</button>
      </nav>
      <div className="admin-content">
        <Routes>
          <Route path="/users" element={<UsersManager />} />
          <Route path="/products" element={<ProductsManager />} />
          <Route path="/referrals" element={<ReferralsManager />} />
          <Route path="/" element={<UsersManager />} />
        </Routes>
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
    <div className="manager-section">
      <h3>User Management</h3>
      
      <div className="actions-bar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={searchUsers} className="btn-primary">Search</button>
        </div>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-success">
          Create User
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={createUser} className="create-form">
          <input
            type="text"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Initial Balance"
            value={newUser.balance}
            onChange={(e) => setNewUser({...newUser, balance: parseFloat(e.target.value)})}
          />
          <button type="submit" className="btn-primary">Create</button>
          <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
        </form>
      )}

      <table className="data-table">
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
              <td>{user.username}</td>
              <td>
                <input
                  type="number"
                  value={user.balance}
                  onChange={(e) => updateBalance(user.id, parseFloat(e.target.value))}
                  className="balance-input"
                />
              </td>
              <td>{user.referred_by || '-'}</td>
              <td>
                <span className={user.is_blocked ? 'status-blocked' : 'status-active'}>
                  {user.is_blocked ? 'Blocked' : 'Active'}
                </span>
              </td>
              <td>
                <button 
                  onClick={() => toggleBlock(user.id, user.is_blocked)}
                  className={user.is_blocked ? 'btn-success' : 'btn-danger'}
                >
                  {user.is_blocked ? 'Unblock' : 'Block'}
                </button>
                <button onClick={() => viewPurchases(user.id)} className="btn-info">
                  Purchases
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="modal">
          <div className="modal-content">
            <h4>Purchase History</h4>
            <button onClick={() => setSelectedUser(null)} className="close-btn">×</button>
            <table className="data-table">
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
                    <td>{purchase.key_value}</td>
                    <td>₹{purchase.amount}</td>
                    <td>{new Date(purchase.purchased_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    <div className="manager-section">
      <h3>Product Management</h3>
      
      <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-success">
        Add Product
      </button>

      {showCreateForm && (
        <form onSubmit={createProduct} className="create-form">
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            required
          />
          <textarea
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
            required
          />
          <input
            type="text"
            placeholder="Duration (e.g., 1 month, 1 year)"
            value={newProduct.duration}
            onChange={(e) => setNewProduct({...newProduct, duration: e.target.value})}
            required
          />
          <button type="submit" className="btn-primary">Create</button>
          <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
        </form>
      )}

      <table className="data-table">
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
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>₹{product.price}</td>
              <td>{product.duration}</td>
              <td>{product.availableKeys}</td>
              <td>
                <button onClick={() => loadKeys(product.id)} className="btn-info">
                  Manage Keys
                </button>
                <button onClick={() => deleteProduct(product.id)} className="btn-danger">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedProduct && (
        <div className="modal">
          <div className="modal-content">
            <h4>Product Keys</h4>
            <button onClick={() => setSelectedProduct(null)} className="close-btn">×</button>
            
            <form onSubmit={addKeys} className="keys-form">
              <textarea
                placeholder="Enter keys (one per line)"
                value={newKeys}
                onChange={(e) => setNewKeys(e.target.value)}
                rows="5"
              />
              <button type="submit" className="btn-primary">Add Keys</button>
              <button type="button" onClick={deleteAllKeys} className="btn-danger">Delete All Keys</button>
            </form>

            <table className="data-table">
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
                    <td>{key.key_value}</td>
                    <td>
                      <span className={key.is_used ? 'status-used' : 'status-available'}>
                        {key.is_used ? 'Used' : 'Available'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => deleteKey(key.id)} className="btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    <div className="manager-section">
      <h3>Referral Management</h3>
      
      <form onSubmit={createReferral} className="create-form">
        <input
          type="number"
          placeholder="Initial Balance"
          value={newBalance}
          onChange={(e) => setNewBalance(parseFloat(e.target.value))}
          required
        />
        <button type="submit" className="btn-success">Generate Referral</button>
      </form>

      <table className="data-table">
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
              <td><strong>{ref.code}</strong></td>
              <td>₹{ref.balance}</td>
              <td>
                <span className={ref.is_used ? 'status-used' : 'status-available'}>
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
  );
}

export default AdminPanel;
