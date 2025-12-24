import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateFlyer = () => {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    template: 'modern',
    products: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSampleProduct = () => {
    const sampleProduct = {
      name: `מוצר דוגמה ${formData.products.length + 1}`,
      price: Math.floor(Math.random() * 100) + 10,
      description: 'תיאור מוצר לדוגמה'
    };
    
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, sampleProduct]
    }));
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // For demo purposes, we'll create the flyer without real products
      // In a real app, you'd first create/select products from the database
      
      if (!formData.title) {
        setError('כותרת הפליר נדרשת');
        setLoading(false);
        return;
      }

      if (formData.products.length === 0) {
        setError('נדרש לפחות מוצר אחד');
        setLoading(false);
        return;
      }

      // Create products first (simplified for demo)
      const createdProducts = [];
      for (const product of formData.products) {
        const productResponse = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: product.name,
            description: product.description,
            price: product.price,
            category: 'כללי'
          })
        });

        if (productResponse.ok) {
          const createdProduct = await productResponse.json();
          createdProducts.push(createdProduct.product._id);
        }
      }

      // Create flyer
      const flyerResponse = await fetch(`${API_BASE_URL}/flyers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          template: formData.template,
          productIds: createdProducts,
          businessInfo: {
            name: 'העסק שלי',
            phone: '050-1234567',
            address: 'תל אביב, ישראל'
          }
        })
      });

      if (flyerResponse.ok) {
        const flyerData = await flyerResponse.json();
        setSuccess('הפליר נוצר בהצלחה!');
        
        // Redirect to dashboard after success
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const errorData = await flyerResponse.json();
        setError(errorData.message || 'שגיאה ביצירת הפליר');
      }

    } catch (error) {
      console.error('Error creating flyer:', error);
      setError('שגיאה בהתחברות לשרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-flyer">
      <header className="page-header">
        <div className="header-content">
          <h1>צור פליר חדש</h1>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="back-button"
          >
            חזור לדשבורד
          </button>
        </div>
      </header>

      <main className="page-main">
        <div className="create-form-container">
          <form onSubmit={handleSubmit} className="create-form">
            {/* Basic Info */}
            <div className="form-section">
              <h2>פרטים בסיסיים</h2>
              
              <div className="form-group">
                <label htmlFor="title">כותרת הפליר</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="הכנס כותרת לפליר"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">תיאור</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="הכנס תיאור לפליר (אופציונלי)"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="template">תבנית עיצוב</label>
                <select
                  id="template"
                  name="template"
                  value={formData.template}
                  onChange={handleInputChange}
                >
                  <option value="modern">מודרני</option>
                  <option value="classic">קלאסי</option>
                  <option value="minimalist">מינימליסטי</option>
                  <option value="colorful">צבעוני</option>
                </select>
              </div>
            </div>

            {/* Products Section */}
            <div className="form-section">
              <div className="section-header">
                <h2>מוצרים</h2>
                <button 
                  type="button" 
                  onClick={addSampleProduct}
                  className="add-product-button"
                >
                  הוסף מוצר דוגמה
                </button>
              </div>

              {formData.products.length === 0 ? (
                <div className="empty-products">
                  <p>לא נוספו מוצרים עדיין</p>
                  <p>לחץ על "הוסף מוצר דוגמה" כדי להתחיל</p>
                </div>
              ) : (
                <div className="products-list">
                  {formData.products.map((product, index) => (
                    <div key={index} className="product-item">
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-price">₪{product.price}</p>
                        <p className="product-description">{product.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="remove-product"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messages */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Submit */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading || formData.products.length === 0}
              >
                {loading ? 'יוצר פליר...' : 'צור פליר'}
              </button>
            </div>
          </form>

          {/* Preview Section */}
          <div className="preview-section">
            <h3>תצוגה מקדימה</h3>
            <div className="flyer-preview">
              <div className={`preview-template ${formData.template}`}>
                <h2 className="preview-title">
                  {formData.title || 'כותרת הפליר'}
                </h2>
                
                {formData.description && (
                  <p className="preview-description">{formData.description}</p>
                )}
                
                <div className="preview-products">
                  {formData.products.length === 0 ? (
                    <p className="no-products">אין מוצרים לתצוגה</p>
                  ) : (
                    formData.products.map((product, index) => (
                      <div key={index} className="preview-product">
                        <h4>{product.name}</h4>
                        <div className="preview-price">₪{product.price}</div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="preview-footer">
                  <p>העסק שלי | 050-1234567 | תל אביב</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .create-flyer {
          min-height: 100vh;
          background: #f5f5f5;
        }
        
        .page-header {
          background: white;
          border-bottom: 1px solid #eee;
          padding: 20px;
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .header-content h1 {
          margin: 0;
          color: #333;
        }
        
        .back-button {
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .back-button:hover {
          background: #5a6268;
        }
        
        .page-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
        }
        
        .create-form-container {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 40px;
          align-items: start;
        }
        
        .create-form {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .form-section {
          margin-bottom: 30px;
        }
        
        .form-section h2 {
          margin: 0 0 20px;
          color: #333;
          font-size: 1.3em;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .add-product-button {
          padding: 8px 16px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.9em;
          transition: background 0.3s;
        }
        
        .add-product-button:hover {
          background: #218838;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          font-family: inherit;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .empty-products {
          text-align: center;
          padding: 40px 20px;
          background: #f8f9fa;
          border-radius: 5px;
          color: #666;
        }
        
        .products-list {
          space-y: 15px;
        }
        
        .product-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 5px;
          margin-bottom: 15px;
        }
        
        .product-info h3 {
          margin: 0 0 5px;
          color: #333;
          font-size: 1.1em;
        }
        
        .product-price {
          margin: 0 0 5px;
          font-weight: bold;
          color: #28a745;
          font-size: 1.1em;
        }
        
        .product-description {
          margin: 0;
          color: #666;
          font-size: 0.9em;
        }
        
        .remove-product {
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 50%;
          width: 25px;
          height: 25px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .remove-product:hover {
          background: #c82333;
        }
        
        .error-message, .success-message {
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .error-message {
          background: #fee;
          color: #c33;
          border: 1px solid #fcc;
        }
        
        .success-message {
          background: #efe;
          color: #393;
          border: 1px solid #cfc;
        }
        
        .submit-button {
          width: 100%;
          padding: 15px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .submit-button:hover:not(:disabled) {
          background: #5a67d8;
        }
        
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .preview-section {
          position: sticky;
          top: 20px;
        }
        
        .preview-section h3 {
          margin: 0 0 20px;
          color: #333;
        }
        
        .flyer-preview {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .preview-template {
          padding: 20px;
          min-height: 300px;
        }
        
        .preview-template.modern {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .preview-template.classic {
          background: #f8f9fa;
          color: #333;
          border: 2px solid #333;
        }
        
        .preview-template.minimalist {
          background: white;
          color: #333;
        }
        
        .preview-template.colorful {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
          color: white;
        }
        
        .preview-title {
          margin: 0 0 15px;
          font-size: 1.5em;
          text-align: center;
        }
        
        .preview-description {
          margin: 0 0 20px;
          text-align: center;
          opacity: 0.9;
        }
        
        .preview-products {
          margin: 20px 0;
        }
        
        .no-products {
          text-align: center;
          opacity: 0.7;
          font-style: italic;
        }
        
        .preview-product {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        
        .preview-product:last-child {
          border-bottom: none;
        }
        
        .preview-product h4 {
          margin: 0;
          font-size: 1em;
        }
        
        .preview-price {
          font-weight: bold;
          font-size: 1.1em;
        }
        
        .preview-footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid rgba(255,255,255,0.2);
          font-size: 0.9em;
          opacity: 0.8;
        }
        
        .preview-footer p {
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .create-form-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .preview-section {
            position: static;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateFlyer;