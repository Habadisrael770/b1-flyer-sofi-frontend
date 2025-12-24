import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, getAuthHeaders } = useAuth();
  const [stats, setStats] = useState({
    totalFlyers: 0,
    totalProducts: 0,
    publishedFlyers: 0,
    draftFlyers: 0
  });
  const [recentFlyers, setRecentFlyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = getAuthHeaders();

      // Fetch flyers
      const flyersResponse = await fetch(`${API_BASE_URL}/flyers?limit=5`, {
        headers
      });
      
      // Fetch products
      const productsResponse = await fetch(`${API_BASE_URL}/products?limit=1`, {
        headers
      });

      if (flyersResponse.ok && productsResponse.ok) {
        const flyersData = await flyersResponse.json();
        const productsData = await productsResponse.json();

        setRecentFlyers(flyersData.flyers || []);
        
        // Calculate stats
        const publishedCount = (flyersData.flyers || []).filter(f => f.status === 'published').length;
        const draftCount = (flyersData.flyers || []).filter(f => f.status === 'draft').length;
        
        setStats({
          totalFlyers: flyersData.totalFlyers || 0,
          totalProducts: productsData.totalProducts || 0,
          publishedFlyers: publishedCount,
          draftFlyers: draftCount
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="loading">טוען נתונים...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>ברוך הבא, {user?.firstName}!</h1>
            <p>מערכת יצירת פליירים חכמה</p>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="logout-button">
              התנתק
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>סך הפליירים</h3>
            <div className="stat-number">{stats.totalFlyers}</div>
          </div>
          <div className="stat-card">
            <h3>פליירים מפורסמים</h3>
            <div className="stat-number">{stats.publishedFlyers}</div>
          </div>
          <div className="stat-card">
            <h3>טיוטות</h3>
            <div className="stat-number">{stats.draftFlyers}</div>
          </div>
          <div className="stat-card">
            <h3>סך המוצרים</h3>
            <div className="stat-number">{stats.totalProducts}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>פעולות מהירות</h2>
          <div className="actions-grid">
            <Link to="/flyer/new" className="action-card">
              <div className="action-icon">📄</div>
              <h3>צור פליר חדש</h3>
              <p>צור פליר חדש עם המוצרים שלך</p>
            </Link>
            
            <div className="action-card" onClick={() => alert('בקרוב - ניהול מוצרים')}>
              <div className="action-icon">📦</div>
              <h3>נהל מוצרים</h3>
              <p>הוסף, ערוך ונהל את המוצרים שלך</p>
            </div>
            
            <div className="action-card" onClick={() => alert('בקרוב - הגדרות')}>
              <div className="action-icon">⚙️</div>
              <h3>הגדרות</h3>
              <p>התאם את ההגדרות האישיות שלך</p>
            </div>
          </div>
        </div>

        {/* Recent Flyers */}
        <div className="recent-flyers">
          <h2>פליירים אחרונים</h2>
          {recentFlyers.length === 0 ? (
            <div className="empty-state">
              <p>אין פליירים עדיין</p>
              <Link to="/flyer/new" className="create-first-button">
                צור את הפליר הראשון שלך
              </Link>
            </div>
          ) : (
            <div className="flyers-grid">
              {recentFlyers.map(flyer => (
                <div key={flyer._id} className="flyer-card">
                  <h3>{flyer.title}</h3>
                  <p className="flyer-description">{flyer.description}</p>
                  <div className="flyer-meta">
                    <span className={`status ${flyer.status}`}>
                      {flyer.status === 'published' ? 'מפורסם' : 'טיוטה'}
                    </span>
                    <span className="date">
                      {new Date(flyer.createdAt).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  <div className="flyer-actions">
                    <button onClick={() => alert('בקרוב - עריכה')}>
                      ערוך
                    </button>
                    <button onClick={() => alert('בקרוב - צפייה')}>
                      צפה
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: #f5f5f5;
        }
        
        .dashboard-header {
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
        
        .header-left h1 {
          margin: 0;
          color: #333;
          font-size: 1.8em;
        }
        
        .header-left p {
          margin: 5px 0 0;
          color: #666;
        }
        
        .logout-button {
          padding: 10px 20px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .logout-button:hover {
          background: #c82333;
        }
        
        .dashboard-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .stat-card h3 {
          margin: 0 0 10px;
          color: #666;
          font-size: 0.9em;
        }
        
        .stat-number {
          font-size: 2.5em;
          font-weight: bold;
          color: #667eea;
        }
        
        .quick-actions {
          margin-bottom: 40px;
        }
        
        .quick-actions h2 {
          margin-bottom: 20px;
          color: #333;
        }
        
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .action-card {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .action-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }
        
        .action-icon {
          font-size: 3em;
          margin-bottom: 15px;
        }
        
        .action-card h3 {
          margin: 0 0 10px;
          color: #333;
        }
        
        .action-card p {
          margin: 0;
          color: #666;
          font-size: 0.9em;
        }
        
        .recent-flyers h2 {
          margin-bottom: 20px;
          color: #333;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 10px;
        }
        
        .create-first-button {
          display: inline-block;
          margin-top: 15px;
          padding: 12px 24px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          transition: background 0.3s;
        }
        
        .create-first-button:hover {
          background: #5a67d8;
        }
        
        .flyers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .flyer-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .flyer-card h3 {
          margin: 0 0 10px;
          color: #333;
        }
        
        .flyer-description {
          color: #666;
          margin-bottom: 15px;
          font-size: 0.9em;
        }
        
        .flyer-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: bold;
        }
        
        .status.published {
          background: #d4edda;
          color: #155724;
        }
        
        .status.draft {
          background: #fff3cd;
          color: #856404;
        }
        
        .date {
          color: #999;
          font-size: 0.8em;
        }
        
        .flyer-actions {
          display: flex;
          gap: 10px;
        }
        
        .flyer-actions button {
          flex: 1;
          padding: 8px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
          transition: background 0.3s;
        }
        
        .flyer-actions button:hover {
          background: #5a67d8;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.2em;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;