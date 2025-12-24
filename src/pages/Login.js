import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );
      }

      if (!result.success) {
        setError(result.error);
      }
      // If successful, the AuthContext will handle the redirect
    } catch (err) {
      setError('שגיאה בהתחברות לשרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>B1 WhatsFlyer</h1>
          <p>מערכת יצירת פליירים חכמה</p>
        </div>

        <div className="login-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            התחברות
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            הרשמה
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">שם פרטי</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="הכנס שם פרטי"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">שם משפחה</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="הכנס שם משפחה (אופציונלי)"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">אימייל</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="הכנס אימייל"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              placeholder="הכנס סיסמה (לפחות 6 תווים)"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'טוען...' : (isLogin ? 'התחבר' : 'הרשם')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? 'אין לך חשבון?' : 'יש לך כבר חשבון?'}
            <button 
              type="button"
              className="link-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'הרשם כאן' : 'התחבר כאן'}
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .login-card {
          background: white;
          border-radius: 10px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .login-header h1 {
          color: #333;
          margin-bottom: 10px;
          font-size: 2em;
        }
        
        .login-header p {
          color: #666;
          margin: 0;
        }
        
        .login-tabs {
          display: flex;
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
        }
        
        .tab {
          flex: 1;
          padding: 10px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          border-bottom: 2px solid transparent;
          transition: all 0.3s;
        }
        
        .tab.active {
          border-bottom-color: #667eea;
          color: #667eea;
          font-weight: bold;
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
        
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          transition: border-color 0.3s;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .error-message {
          background: #fee;
          color: #c33;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .submit-button {
          width: 100%;
          padding: 12px;
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
        
        .login-footer {
          text-align: center;
          margin-top: 20px;
        }
        
        .link-button {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          text-decoration: underline;
          margin-right: 5px;
        }
        
        .link-button:hover {
          color: #5a67d8;
        }
      `}</style>
    </div>
  );
};

export default Login;