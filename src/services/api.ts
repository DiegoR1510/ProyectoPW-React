const API_BASE_URL = 'http://localhost:3001/api';

export interface Review {
  id?: number;
  user: string;
  comment: string;
  rating: number;
}

export interface Game {
  id: number;
  title: string;
  image: string;
  price: number;
  trailer: string;
  reviews: Review[];
  genre: string[];
  platform: string[];
}

export interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Login
  async login(name: string, password: string): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/login', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    });
  }

  // Get all games
  async getGames(): Promise<Game[]> {
    return this.request<Game[]>('/games');
  }

  // Get game by ID
  async getGame(id: number): Promise<Game> {
    return this.request<Game>(`/games/${id}`);
  }

  // Get top rated games
  async getTopRatedGames(): Promise<Game[]> {
    return this.request<Game[]>('/games/top-rated');
  }

  // Get top sellers
  async getTopSellers(): Promise<Game[]> {
    return this.request<Game[]>('/games/top-sellers');
  }

  // Add review to a game (token required)
  async addReview(gameId: number, review: Omit<Review, 'id'>, token: string): Promise<Review> {
    return this.request<Review>(`/games/${gameId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Delete a game (admin only, token required)
  async deleteGame(gameId: number, token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/games/${gameId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/health');
  }
}

export const apiService = new ApiService(); 