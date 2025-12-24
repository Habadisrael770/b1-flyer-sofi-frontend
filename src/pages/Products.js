import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    barcode: '',
    category: '',
    imageUrl: ''
  });

  const { user, logout } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchProducts();
  }, []);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

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
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProduct) {
        await axios.put(`${API_BASE_URL}/api/products/${editingProduct._id}`, formData, {
          headers: getAuthHeaders()
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/products`, formData, {
          headers: getAuthHeaders()
        });
      }
      
      fetchProducts();
      resetForm();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        return;
      }
      setError(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המוצר?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: getAuthHeaders()
      });
      fetchProducts();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        return;
      }
      setError('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      barcode: product.barcode,
      category: product.category,
      imageUrl: product.imageUrl
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      barcode: '',
      category: '',
      imageUrl: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>מוצרים</h1>
        <div className="user-info">
          <span>שלום, {user?.firstName}</span>
          <button onClick={logout} className="logout-btn">התנתקות</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="products-actions">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="add-btn"
        >
          {showForm ? 'בטל' : 'הוסף מוצר'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>שם המוצר</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>מחיר</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>ברקוד</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>קטגוריה</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
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
          <div className="form-group">
            <label>כתובת תמונה</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button type="submit">
              {editingProduct ? 'עדכן' : 'הוסף'}
            </button>
            <button type="button" onClick={resetForm}>
              בטל
            </button>
          </div>
        </form>
      )}

      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.name} />
            )}
            <h3>{product.name}</h3>
            <p className="price">₪{product.price}</p>
            {product.description && <p className="description">{product.description}</p>}
            {product.barcode && <p className="barcode">ברקוד: {product.barcode}</p>}
            {product.category && <p className="category">קטגוריה: {product.category}</p>}
            <div className="product-actions">
              <button onClick={() => handleEdit(product)}>עריכה</button>
              <button onClick={() => handleDelete(product._id)}>מחיקה</button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="empty-state">
          <p>אין מוצרים עדיין. הוסף את המוצר הראשון שלך!</p>
        </div>
      )}
    </div>
  );
};

export default Products;