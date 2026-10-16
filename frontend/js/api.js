/* PULSE API Helper & Utility Functions */
const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : '/api';

const PulseAPI = {
  getToken() {
    return localStorage.getItem('pulse_token');
  },

  setToken(token) {
    localStorage.setItem('pulse_token', token);
  },

  removeToken() {
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('pulse_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setCurrentUser(user) {
    localStorage.setItem('pulse_user', JSON.stringify(user));
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.removeToken();
          if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register') && window.location.pathname !== '/' && !window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
          }
        }
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

// UI Helper Utilities
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : '💡'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function initThemeToggle() {
  const savedTheme = localStorage.getItem('pulse_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('pulse_theme', next);
      themeBtn.innerHTML = next === 'dark' ? '☀️' : '🌙';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
});
