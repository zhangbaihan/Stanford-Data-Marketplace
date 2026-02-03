// API service for communicating with the backend

import type {
  DatasetsResponse,
  TagsResponse,
  DatasetResponse,
  DownloadResponse,
  AuthStatusResponse,
} from './types';

// Backend API URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(error.message || 'Request failed', response.status);
  }

  return response.json();
}

// Dataset endpoints
export const datasetsApi = {
  // Get all datasets with optional filtering
  getAll: async (params?: {
    page?: number;
    limit?: number;
    tags?: string[];
  }): Promise<DatasetsResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));
    
    const query = searchParams.toString();
    return fetchApi<DatasetsResponse>(`/api/datasets${query ? `?${query}` : ''}`);
  },

  // Search datasets
  search: async (query: string, page = 1, limit = 50): Promise<DatasetsResponse> => {
    const searchParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    return fetchApi<DatasetsResponse>(`/api/datasets/search?${searchParams}`);
  },

  // Get single dataset by ID
  getById: async (id: string): Promise<DatasetResponse> => {
    return fetchApi<DatasetResponse>(`/api/datasets/${id}`);
  },

  // Get all unique tags
  getTags: async (): Promise<TagsResponse> => {
    return fetchApi<TagsResponse>('/api/datasets/tags');
  },

  // Get download URL (requires authentication)
  getDownloadUrl: async (id: string): Promise<DownloadResponse> => {
    return fetchApi<DownloadResponse>(`/api/datasets/${id}/download`);
  },
};

// Auth endpoints
export const authApi = {
  // Check authentication status
  getStatus: async (): Promise<AuthStatusResponse> => {
    return fetchApi<AuthStatusResponse>('/api/auth/me');
  },

  // Get Google OAuth login URL
  getLoginUrl: (): string => {
    return `${API_BASE_URL}/api/auth/google`;
  },

  // Logout
  logout: async (): Promise<void> => {
    await fetchApi<{ message: string }>('/api/auth/logout');
  },
};

export { ApiError };
