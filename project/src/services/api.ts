const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(emailOrPhone: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password })
    });
  }

  async register(userData: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    language: 'en' | 'hi';
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  // Questions endpoints
  async getQuestions(params: {
    filter?: string;
    language?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/questions?${searchParams.toString()}`);
  }

  async getQuestion(id: string) {
    return this.request(`/questions/${id}`);
  }

  async createQuestion(questionData: {
    title: string;
    content: string;
    tags: string[];
    language: 'en' | 'hi';
    images?: string[];
  }) {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    });
  }

  async updateQuestion(id: string, questionData: {
    title?: string;
    content?: string;
    tags?: string[];
    images?: string[];
  }) {
    return this.request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    });
  }

  async deleteQuestion(id: string) {
    return this.request(`/questions/${id}`, {
      method: 'DELETE'
    });
  }

  async voteQuestion(id: string, voteType: 'up' | 'down') {
    return this.request(`/questions/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType })
    });
  }

  async followQuestion(id: string) {
    return this.request(`/questions/${id}/follow`, {
      method: 'POST'
    });
  }

  // Answers endpoints
  async createAnswer(answerData: {
    content: string;
    questionId: string;
    images?: string[];
  }) {
    return this.request('/answers', {
      method: 'POST',
      body: JSON.stringify(answerData)
    });
  }

  async updateAnswer(id: string, answerData: {
    content?: string;
    images?: string[];
  }) {
    return this.request(`/answers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(answerData)
    });
  }

  async deleteAnswer(id: string) {
    return this.request(`/answers/${id}`, {
      method: 'DELETE'
    });
  }

  async voteAnswer(id: string, voteType: 'up' | 'down') {
    return this.request(`/answers/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType })
    });
  }

  async acceptAnswer(id: string) {
    return this.request(`/answers/${id}/accept`, {
      method: 'POST'
    });
  }

  async unacceptAnswer(id: string) {
    return this.request(`/answers/${id}/unaccept`, {
      method: 'POST'
    });
  }

  // Notifications endpoints
  async getNotifications(params: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/notifications?${searchParams.toString()}`);
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT'
    });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE'
    });
  }

  async clearAllNotifications() {
    return this.request('/notifications/clear-all', {
      method: 'DELETE'
    });
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(profileData: {
    name?: string;
    avatar?: string;
    language?: 'en' | 'hi';
    preferences?: any;
  }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async getUserQuestions(id: string, params: {
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/users/${id}/questions?${searchParams.toString()}`);
  }

  async getUserAnswers(id: string, params: {
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/users/${id}/answers?${searchParams.toString()}`);
  }

  async followTag(tag: string) {
    return this.request('/users/follow-tag', {
      method: 'POST',
      body: JSON.stringify({ tag })
    });
  }

  async blockUser(userId: string) {
    return this.request('/users/block-user', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  // Upload endpoints
  async uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async deleteImage(filename: string) {
    return this.request(`/upload/images/${filename}`, {
      method: 'DELETE'
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService; 