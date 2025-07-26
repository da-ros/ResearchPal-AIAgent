export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}

export interface SearchRequest {
  query: string;
}

export interface SearchResponse {
  papers: Paper[];
  total: number;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  subjects: string[];
  date: string;
  arxiv_id?: string;
}

export interface LibraryPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  arxiv_id: string;
  date_added: string;
  tags: string[];
  notes: string;
}

export interface LibraryRequest {
  arxiv_id: string;
  title: string;
  authors: string[];
  abstract: string;
  tags?: string[];
  notes?: string;
}

export interface LibraryResponse {
  papers: LibraryPaper[];
  total: number;
}

export class ApiService {
  private baseUrl = 'http://localhost:8000';

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    const response = await fetch(`${this.baseUrl}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getLibrary(): Promise<LibraryResponse> {
    const response = await fetch(`${this.baseUrl}/api/library`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async saveToLibrary(request: LibraryRequest): Promise<{ message: string; arxiv_id: string }> {
    const response = await fetch(`${this.baseUrl}/api/library`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async removeFromLibrary(arxiv_id: string): Promise<{ message: string; arxiv_id: string }> {
    const response = await fetch(`${this.baseUrl}/api/library/${arxiv_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();

// Recent searches service
export class RecentSearchesService {
  private static STORAGE_KEY = "recent_searches";
  private static MAX_SEARCHES = 10;

  static getRecentSearches(): Array<{ topic: string; count: number; timestamp: number }> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static addRecentSearch(topic: string, count: number = 0) {
    try {
      const searches = this.getRecentSearches();
      
      // Remove existing entry if it exists
      const filtered = searches.filter(s => s.topic !== topic);
      
      // Add new entry at the beginning
      const newSearches = [
        { topic, count, timestamp: Date.now() },
        ...filtered
      ].slice(0, this.MAX_SEARCHES);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newSearches));
    } catch (error) {
      console.error("Failed to save recent search:", error);
    }
  }

  static clearRecentSearches() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recent searches:", error);
    }
  }
} 