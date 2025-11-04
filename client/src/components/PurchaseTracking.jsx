import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Download } from 'lucide-react';

function PurchaseTracking() {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMod, setFilterMod] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalRevenue: 0,
    uniqueUsers: 0
  });

  useEffect(() => {
    fetchPurchases();
    fetchMods();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [purchases, searchTerm, filterMod, filterDuration]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/purchases/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setPurchases(data.purchases || []);
        calculateStats(data.purchases || []);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load purchases' });
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMods = async () => {
    try {
      const response = await fetch('/api/mods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMods(data.mods || []);
    } catch (error) {
      console.error('Error fetching mods:', error);
    }
  };

  const calculateStats = (purchasesData) => {
    const totalRevenue = purchasesData.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const uniqueUsers = new Set(purchasesData.map(p => p.user_id)).size;
    
    setStats({
      totalPurchases: purchasesData.length,
      totalRevenue: totalRevenue.toFixed(2),
      uniqueUsers
    });
  };

  const applyFilters = () => {
    let filtered = [...purchases];

    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        (purchase.username && purchase.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (purchase.mod_name && purchase.mod_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (purchase.key_value && purchase.key_value.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterMod) {
      filtered = filtered.filter(purchase => purchase.mod_id === parseInt(filterMod));
    }

    if (filterDuration) {
      filtered = filtered.filter(purchase => purchase.duration_days === parseInt(filterDuration));
    }

    setFilteredPurchases(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Purchase ID', 'User', 'Mod Name', 'Key', 'Duration (Days)', 'Amount', 'Date'];
    const csvData = filteredPurchases.map(p => [
      p.id,
      p.username,
      p.mod_name,
      p.key_value,
      p.duration_days,
      p.amount,
      new Date(p.purchase_date).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-tracking-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const uniqueDurations = [...new Set(purchases.map(p => p.duration_days))].filter(Boolean).sort((a, b) => a - b);

  return (
    <div className="page-container-new">
      <div className="page-header-new">
        <div>
          <h1 className="page-title-new">Purchase Tracking</h1>
          <p className="page-subtitle-new">Monitor all user purchases and transactions</p>
        </div>
        <button onClick={exportToCSV} className="btn-primary-modern" disabled={filteredPurchases.length === 0}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {message.text && (
        <div className={`alert-new ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dashboard-cards mb-4">
        <div className="stat-card stat-card-purple">
          <div className="stat-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Purchases</p>
            <p className="stat-value">{stats.totalPurchases}</p>
          </div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-icon">
            <span>$</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Revenue</p>
            <p className="stat-value">${stats.totalRevenue}</p>
          </div>
        </div>
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">
            <span>👤</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Unique Users</p>
            <p className="stat-value">{stats.uniqueUsers}</p>
          </div>
        </div>
      </div>

      <div className="card-modern">
        <div className="card-header-modern">
          <Filter size={20} />
          <h3 className="card-title-modern">Filters</h3>
        </div>
        <div className="filters-grid">
          <div className="search-box-modern">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by user, mod name, or key..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-modern"
            />
          </div>
          <div className="form-group-modern">
            <label>Filter by Mod</label>
            <select
              value={filterMod}
              onChange={(e) => setFilterMod(e.target.value)}
              className="input-modern"
            >
              <option value="">All Mods</option>
              {mods.map(mod => (
                <option key={mod.id} value={mod.id}>{mod.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group-modern">
            <label>Filter by Duration</label>
            <select
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value)}
              className="input-modern"
            >
              <option value="">All Durations</option>
              {uniqueDurations.map(duration => (
                <option key={duration} value={duration}>{duration} Days</option>
              ))}
            </select>
          </div>
          {(searchTerm || filterMod || filterDuration) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterMod('');
                setFilterDuration('');
              }}
              className="btn-secondary-modern"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="card-modern mt-4">
        <div className="table-container-modern">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Mod Name</th>
                <th>License Key</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Purchase Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="loading-spinner">Loading...</div>
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="empty-state-full">
                      <ShoppingCart size={48} />
                      <p>No purchases found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td>{purchase.id}</td>
                    <td className="font-semibold">{purchase.username || 'Unknown'}</td>
                    <td>{purchase.mod_name || 'N/A'}</td>
                    <td className="font-mono text-sm">{purchase.key_value || '-'}</td>
                    <td>
                      <span className="badge-new badge-info">
                        {purchase.duration_days ? `${purchase.duration_days} Days` : 'N/A'}
                      </span>
                    </td>
                    <td className="font-semibold text-green">${parseFloat(purchase.amount || 0).toFixed(2)}</td>
                    <td>{new Date(purchase.purchase_date).toLocaleString()}</td>
                    <td>
                      <span className={`badge-new ${purchase.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {purchase.status || 'completed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer-modern">
          <p className="text-muted">
            Showing {filteredPurchases.length} of {purchases.length} purchases
          </p>
        </div>
      </div>
    </div>
  );
}

export default PurchaseTracking;
