import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function UserDashboard({ user, token, onLogout }) {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [balance, setBalance] = useState(user.balance);

  useEffect(() => {
    loadProducts();
    loadPurchases();
    loadProfile();
  }, []);

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

  const buyProduct = async (productId) => {
    if (!confirm('Are you sure you want to purchase this product?')) return;
    
    try {
      const response = await axios.post(`${API_URL}/purchase/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Purchase successful! Your key: ${response.data.key}`);
      setBalance(response.data.newBalance);
      loadPurchases();
      loadProducts();
    } catch (error) {
      alert(error.response?.data?.error || 'Purchase failed');
    }
  };

  return (
    <div className="user-dashboard">
      <nav className="user-nav">
        <h2>Dashboard</h2>
        <div className="user-info">
          <span>{user.username}</span>
          <span className="balance">Balance: ₹{balance}</span>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <section className="products-section">
          <h3>Available Products</h3>
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <div className="product-details">
                  <span className="price">₹{product.price}</span>
                  <span className="duration">{product.duration}</span>
                </div>
                <div className="product-status">
                  {product.available ? (
                    <span className="status-available">In Stock</span>
                  ) : (
                    <span className="status-out">Out of Stock</span>
                  )}
                </div>
                <button 
                  onClick={() => buyProduct(product.id)}
                  disabled={!product.available || balance < product.price}
                  className={product.available && balance >= product.price ? 'btn-primary' : 'btn-disabled'}
                >
                  {balance < product.price ? 'Insufficient Balance' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="purchases-section">
          <h3>My Purchases</h3>
          {purchases.length === 0 ? (
            <p className="no-data">No purchases yet</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Key</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td>{purchase.product_name}</td>
                    <td><code>{purchase.key_value}</code></td>
                    <td>{purchase.duration}</td>
                    <td>₹{purchase.amount}</td>
                    <td>{new Date(purchase.purchased_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default UserDashboard;
