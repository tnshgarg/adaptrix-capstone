const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(name: string, email: string, password: string) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getMe() {
    return await this.request('/api/auth/me');
  }

  logout(): void {
    this.removeToken();
  }

  // Adapters endpoints
  async getAdapters(params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/api/adapters${queryString ? '?' + queryString : ''}`);
  }

  async getAdapter(id: string) {
    return await this.request(`/api/adapters/${id}`);
  }

  async createAdapter(data: any) {
    return await this.request('/api/adapters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdapter(id: string, data: any) {
    return await this.request(`/api/adapters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdapter(id: string) {
    return await this.request(`/api/adapters/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/api/adapters/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return await this.request('/api/dashboard/stats');
  }

  // Reviews endpoints
  async createReview(data: any) {
    return await this.request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReviews(adapterId: string) {
    return await this.request(`/api/reviews/adapter/${adapterId}`);
  }

  async updateReview(id: string, data: any) {
    return await this.request(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReview(id: string) {
    return await this.request(`/api/reviews/${id}`, {
      method: 'DELETE',
    });
  }
}

const apiClient = new APIClient();
export default apiClient;
