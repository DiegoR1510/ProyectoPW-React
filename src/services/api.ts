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
  esta_oferta?: number;
  offer?: boolean;
  precio_oferta?: number;
}

export interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

export interface Venta {
  id: number;
  fecha: string;
  codigo: string;
  monto_pagado: number;
  juego: string;
}

// Evento personalizado para notificar cuando el token expira
export const tokenExpiredEvent = new CustomEvent('tokenExpired');

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

    // Manejar errores de token expirado
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.message === 'Token inválido') {
        // Disparar evento para notificar que el token expiró
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Verificar si un token es válido
  async validateToken(token: string): Promise<boolean> {
    try {
      await this.request('/validate-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
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
  async addReview(gameId: number, review: { comment: string; rating: number }, token: string): Promise<Review> {
    return this.request<Review>(`/games/${gameId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
      headers: {
        'Content-Type': 'application/json',
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

  // Actualizar precio de oferta de un juego (admin only, token required)
  async setGameOffer(gameId: number, precio_oferta: number, token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/games/${gameId}/oferta`, {
      method: 'PATCH',
      body: JSON.stringify({ precio_oferta }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Obtener historial de compras del usuario
  async getHistorialVentas(usuarioId: number, token?: string): Promise<Venta[]> {
    return this.request<Venta[]>(`/ventas/${usuarioId}`, {
      headers: {
        'Authorization': `Bearer ${token || localStorage.getItem('token') || ''}`
      }
    });
  }
  // Obtener ganancias por mes (solo admin)
  async getEarningsByMonth(token: string): Promise<number[]> {
    const res = await this.request<{ earnings: number[] }>(
      '/admin/earnings-by-month',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.earnings;
  }
  // Obtener todas las ventas (solo admin)
  async getAllVentas(token: string): Promise<any[]> {
    return this.request<any[]>(
      '/ventas',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
  // Obtener cantidad de usuarios (solo admin)
  async getUsuariosCount(token: string): Promise<number> {
    const res = await this.request<{ total: number }>(
      '/usuarios/count',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.total;
  }

  // Obtener lista de usuarios (solo admin)
  async getUsuarios(token: string): Promise<any[]> {
    return this.request<any[]>(
      '/usuarios',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/health');
  }
}
// obtener historial
export const apiService = new ApiService(); 