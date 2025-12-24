import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Flyers = () => {
  const [flyers, setFlyers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFlyer, setEditingFlyer] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    template: 'template1',
    layout: 'grid',
    colors: { primary: '#007bff', secondary: '#28a745' },
    fonts: { title: 'Arial', body: 'Arial' }
  });

  const { user, logout } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchFlyers();
    fetchProducts();
  }, []);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  const fetchFlyers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/flyers`, {
        headers: getAuthHeaders()
      });
      setFlyers(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        return;
      }
      setError('Failed to fetch flyers');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        headers: getAuthHeaders()
      });
      setProducts(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        return;
      }
      console.error('Failed to fetch products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const flyerData = {
      ...formData,
      products: selectedProducts
    };

    try {
      if (editingFlyer) {
        await axios.put(`${API_BASE_URL}/api/flyers/${editingFlyer._id}`, flyerData, {
          headers: getAuthHeaders()
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/flyers`, flyerData, {
          headers: getAuthHeaders()
        });
      }
      
      fetchFlyers();
      resetForm();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        return;
      }
      setError(error.response?.data?.message || 'Failed to save flyer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הפליירי?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/flyers/${id}`, {
        headers: getAuthHeaders()
      });
      fetchFlyers();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        return;
      }
      setError('Failed to delete flyer');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/flyers/${id}/duplicate`, {}, {
        headers: getAuthHeaders()
      });
      fetchFlyers();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        return;
      }
      setError('Failed to duplicate flyer');
    }
  };

  const handleEdit = (flyer) => {
    setEditingFlyer(flyer);
    setFormData({
      title: flyer.title,
      description: flyer.description,
      template: flyer.template,
      layout: flyer.layout,
      colors: flyer.colors,
      fonts: flyer.fonts
    });
    setSelectedProducts(flyer.products.map(p => p.productId));
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      template: 'template1',
      layout: 'grid',
      colors: { primary: '#007bff', secondary: '#28a745' },
      fonts: { title: 'Arial', body: 'Arial' }
    });
    setSelectedProducts([]);
    setEditingFlyer(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flyers-container">
      <div className="flyers-header">
        <h1>פליירים</h1>
        <div className="user-info">
          <span>שלום, {user?.firstName}</span>
          <button onClick={logout} className="logout-btn">התנתקות</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="flyers-actions">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="add-btn"
        >
          {showForm ? 'בטל' : 'צור פליירי'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flyer-form">
          <div className="form-group">
            <label>כותרת הפליירי</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>תיאור</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>תבנית</label>
              <select
                name="template"
                value={formData.template}
                onChange={handleChange}
              >
                <option value="template1">תבנית 1</option>
                <option value="template2">תבנית 2</option>
                <option value="template3">תבנית 3</option>
                <option value="template4">תבנית 4</option>
              </select>
            </div>
            <div className="form-group">
              <label>פריסה</label>
              <select
                name="layout"
                value={formData.layout}
                onChange={handleChange}
              >
                <option value="grid">רשת</option>
                <option value="list">רשימה</option>
                <option value="cards">כרטיסים</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>בחר מוצרים</label>
            <div className="products-selector">
              {products.map(product => (
                <div key={product._id} className="product-checkbox">
                  <input
                    type="checkbox"
                    id={product._id}
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => handleProductToggle(product._id)}
                  />
                  <label htmlFor={product._id}>
                    {product.name} - ₪{product.price}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit">
              {editingFlyer ? 'עדכן' : 'צור'}
            </button>
            <button type="button" onClick={resetForm}>
              בטל
            </button>
          </div>
        </form>
      )}

      <div className="flyers-grid">
        {flyers.map(flyer => (
          <div key={flyer._id} className="flyer-card">
            <h3>{flyer.title}</h3>
            {flyer.description && <p className="description">{flyer.description}</p>}
            <p className="template">תבנית: {flyer.template}</p>
            <p className="products-count">מוצרים: {flyer.products.length}</p>
            <div className="products-list">
              {flyer.products.slice(0, 3).map(product => (
                <span key={product.productId} className="product-tag">
                  {product.name}
                </span>
              ))}
              {flyer.products.length > 3 && (
                <span className="more-products">+{flyer.products.length - 3} עוד</span>
              )}
            </div>
            <div className="flyer-actions">
              <button onClick={() => handleEdit(flyer)}>עריכה</button>
              <button onClick={() => handleDuplicate(flyer._id)}>שכפול</button>
              <button onClick={() => handleDelete(flyer._id)}>מחיקה</button>
            </div>
          </div>
        ))}
      </div>

      {flyers.length === 0 && (
        <div className="empty-state">
          <p>אין פליירים עדיין. צור את הפליירי הראשון שלך!</p>
        </div>
      )}
    </div>
  );
};

export default Flyers;