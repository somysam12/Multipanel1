import { useState, useEffect } from 'react';
import { Trash2, Search, AlertTriangle, Key } from 'lucide-react';

function DeleteKeys() {
  const [keys, setKeys] = useState([]);
  const [mods, setMods] = useState([]);
  const [selectedMod, setSelectedMod] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMods();
    fetchKeys();
  }, []);

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

  const fetchKeys = async (modId = null) => {
    try {
      const url = modId ? `/api/license-keys/mod/${modId}` : '/api/license-keys/all';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching keys:', error);
      setMessage({ type: 'error', text: 'Failed to load license keys' });
    }
  };

  const handleModChange = (modId) => {
    setSelectedMod(modId);
    if (modId) {
      fetchKeys(modId);
    } else {
      fetchKeys();
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL license keys? This action cannot be undone!')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/license-keys/delete-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Deleted ${data.count} license keys successfully` });
        fetchKeys();
        setSelectedMod('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete keys' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDeleteByMod = async () => {
    if (!selectedMod) {
      setMessage({ type: 'error', text: 'Please select a mod first' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    const modName = mods.find(m => m.id === parseInt(selectedMod))?.name;
    
    if (!confirm(`Are you sure you want to delete all license keys for "${modName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/license-keys/delete-by-mod/${selectedMod}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Deleted ${data.count} license keys for "${modName}"` });
        fetchKeys(selectedMod);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete keys' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDeleteSingle = async (keyId, keyValue) => {
    if (!confirm(`Are you sure you want to delete key "${keyValue}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/license-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Key "${keyValue}" deleted successfully` });
        if (selectedMod) {
          fetchKeys(selectedMod);
        } else {
          fetchKeys();
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete key' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const filteredKeys = keys.filter(key =>
    key.key_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (key.mod_name && key.mod_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container-new">
      <div className="page-header-new">
        <div>
          <h1 className="page-title-new">Delete License Keys</h1>
          <p className="page-subtitle-new">Manage and remove license keys</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert-new ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card-modern mb-4">
        <div className="card-header-modern">
          <Key size={20} />
          <h3 className="card-title-modern">Bulk Actions</h3>
        </div>
        <div className="card-body-modern">
          <div className="action-buttons-grid">
            <div className="form-group-modern">
              <label>Select Mod to Delete Keys</label>
              <select
                value={selectedMod}
                onChange={(e) => handleModChange(e.target.value)}
                className="input-modern"
              >
                <option value="">All Mods</option>
                {mods.map(mod => (
                  <option key={mod.id} value={mod.id}>{mod.name}</option>
                ))}
              </select>
            </div>
            <div className="button-group-modern">
              <button
                onClick={handleDeleteByMod}
                disabled={loading || !selectedMod}
                className="btn-warning-modern"
              >
                <Trash2 size={18} />
                Delete Keys of Selected Mod
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={loading}
                className="btn-danger-modern"
              >
                <Trash2 size={18} />
                Delete All Keys
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-modern">
        <div className="search-box-modern">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search keys by key value or mod name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-modern"
          />
        </div>

        <div className="table-container-modern">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Key Value</th>
                <th>Mod Name</th>
                <th>Duration (Days)</th>
                <th>Price</th>
                <th>Status</th>
                <th>Used By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="empty-state-full">
                      <AlertTriangle size={48} />
                      <p>{searchTerm ? 'No keys found matching your search' : 'No license keys available'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredKeys.map(key => (
                  <tr key={key.id}>
                    <td>{key.id}</td>
                    <td className="font-mono font-semibold">{key.key_value}</td>
                    <td>{key.mod_name || 'Unknown'}</td>
                    <td>{key.duration_days}</td>
                    <td>${key.price}</td>
                    <td>
                      <span className={`badge-new ${key.is_used ? 'badge-success' : 'badge-warning'}`}>
                        {key.is_used ? 'Used' : 'Available'}
                      </span>
                    </td>
                    <td>{key.used_by_username || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteSingle(key.id, key.key_value)}
                        disabled={loading}
                        className="btn-danger-small"
                        title="Delete key"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer-modern">
          <p className="text-muted">
            Total Keys: {filteredKeys.length} | 
            Available: {filteredKeys.filter(k => !k.is_used).length} | 
            Used: {filteredKeys.filter(k => k.is_used).length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DeleteKeys;
