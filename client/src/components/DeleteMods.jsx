import { useState, useEffect } from 'react';
import { Trash2, Search, AlertTriangle } from 'lucide-react';

function DeleteMods() {
  const [mods, setMods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMods();
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
      setMessage({ type: 'error', text: 'Failed to load mods' });
    }
  };

  const handleDelete = async (modId, modName) => {
    if (!confirm(`Are you sure you want to delete "${modName}"? This will also delete all associated license keys.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/mods/${modId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Mod "${modName}" deleted successfully` });
        fetchMods();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete mod' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const filteredMods = mods.filter(mod =>
    mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mod.description && mod.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container-new">
      <div className="page-header-new">
        <div>
          <h1 className="page-title-new">Delete Mod Names</h1>
          <p className="page-subtitle-new">Remove mod entries from the system</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert-new ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card-modern">
        <div className="search-box-modern">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search mods by name or description..."
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
                <th>Mod Name</th>
                <th>Description</th>
                <th>Version</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMods.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    <div className="empty-state-full">
                      <AlertTriangle size={48} />
                      <p>{searchTerm ? 'No mods found matching your search' : 'No mods available'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMods.map(mod => (
                  <tr key={mod.id}>
                    <td>{mod.id}</td>
                    <td className="font-semibold">{mod.name}</td>
                    <td className="text-muted">{mod.description || 'No description'}</td>
                    <td>{mod.version || 'N/A'}</td>
                    <td>{new Date(mod.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(mod.id, mod.name)}
                        disabled={loading}
                        className="btn-danger-small"
                        title="Delete mod"
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
          <p className="text-muted">Total Mods: {filteredMods.length}</p>
        </div>
      </div>
    </div>
  );
}

export default DeleteMods;
