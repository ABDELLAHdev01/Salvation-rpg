import toast from 'react-hot-toast';

const MOCK_AUTH = true;
const OFFLINE_MODE = true;
const MOCK_USERS_KEY = 'mockUsers';
const MOCK_SESSION_USER_KEY = 'mockSessionUser';
const OFFLINE_USERNAME = 'offline-hero';

const base64UrlEncode = (value) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const createMockToken = (username, expiresInSeconds = 3600) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'none', typ: 'JWT' };
  const payload = { sub: username, exp: now + expiresInSeconds };
  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
};

class AuthService {
  ensureOfflineSession() {
    const existing = localStorage.getItem(MOCK_SESSION_USER_KEY);
    if (!existing) {
      this.createMockSession(OFFLINE_USERNAME);
    }
  }

  async login(username, password) {
    if (OFFLINE_MODE) {
      const data = this.createMockSession(username?.trim() || OFFLINE_USERNAME);
      toast.success('Welcome back!');
      return data;
    }

    if (MOCK_AUTH) {
      if (!username || !password) {
        this.handleError(new Error('Username and password are required!'), 'Username and password are required!');
      }

      const users = this.getMockUsers();
      const user = users[username];

      if (!user || user.password !== password) {
        this.handleError(new Error('Invalid credentials.'), 'Invalid credentials.');
      }

      const data = this.createMockSession(username);
      toast.success('Login successful!');
      return data;
    }

    return this.createMockSession(username?.trim() || OFFLINE_USERNAME);
  }

  async register(username, password) {
    if (OFFLINE_MODE) {
      const data = this.createMockSession(username?.trim() || OFFLINE_USERNAME);
      toast.success('Welcome!');
      return data;
    }

    this.validateCredentials(username, password);

    if (MOCK_AUTH) {
      const users = this.getMockUsers();

      if (users[username]) {
        this.handleError(new Error('Username already exists.'), 'Username already exists.');
      }

      users[username] = { username, password };
      this.setMockUsers(users);

      const data = this.createMockSession(username);
      toast.success('Registration successful!');
      return data;
    }

    return this.createMockSession(username?.trim() || OFFLINE_USERNAME);
  }

  async externalLogin(username, password) {
    return this.login(username.trim(), password);
  }

  async externalRegister(username, password) {
    return this.register(username.trim(), password);
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(MOCK_SESSION_USER_KEY);
  }

  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated() {
    if (OFFLINE_MODE) {
      this.ensureOfflineSession();
      return true;
    }

    return !!this.getAccessToken();
  }

  getCurrentUsername() {
    if (OFFLINE_MODE) {
      this.ensureOfflineSession();
      return localStorage.getItem(MOCK_SESSION_USER_KEY);
    }

    if (MOCK_AUTH) {
      return localStorage.getItem(MOCK_SESSION_USER_KEY);
    }

    return null;
  }

  async refreshAccessToken() {
    if (MOCK_AUTH) {
      const username = localStorage.getItem(MOCK_SESSION_USER_KEY);
      if (!username) {
        this.logout();
        throw new Error('No mock session available');
      }

      const accessToken = createMockToken(username, 3600);
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    }
    return this.createMockSession(OFFLINE_USERNAME).accessToken;
  }

  attachTokenToRequest(config) {
    const token = this.getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }

  validateCredentials(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required!');
    }
    if (username.length < 3 || password.length < 6) {
      throw new Error('Username must be at least 3 characters and password at least 6 characters!');
    }
    if (!/^[a-zA-Z0-9]+$/.test(username) || !/^[a-zA-Z0-9]+$/.test(password)) {
      throw new Error('Username and password must be alphanumeric!');
    }
    if (username === password) {
      throw new Error('Password cannot be the same as username!');
    }
  }

  storeTokens(data) {
    const { accessToken, refreshToken } = data;
    if (!accessToken || !refreshToken) {
      throw new Error('Invalid response: Missing tokens');
    }
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getMockUsers() {
    try {
      const raw = localStorage.getItem(MOCK_USERS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  setMockUsers(users) {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }

  createMockSession(username) {
    const accessToken = createMockToken(username, 3600);
    const refreshToken = createMockToken(username, 86400);
    const data = { accessToken, refreshToken, user: { username } };
    this.storeTokens(data);
    localStorage.setItem(MOCK_SESSION_USER_KEY, username);
    return data;
  }

  handleError(error, fallbackMessage) {
    const message = error?.response?.data?.message || fallbackMessage;
    toast.error(message);
    throw new Error(message);
  }
}

const authService = new AuthService();
export default authService;
