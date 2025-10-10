import { DocumentTree, DocumentContent } from '@/interface/Document';
import { fetchWithAuth } from '../api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export const documentsApi = {
  getTree: async (): Promise<DocumentTree[]> => {
    try {
      const response = await fetchWithAuth(`${API_URL}/admin/docs/tree`);

      if (!response.ok) {
        throw new Error('Failed to fetch documents tree');
      }

      const data = await response.json();

      // Check if data is wrapped in a response object
      let documents = data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {

        // Check for common wrapper patterns
        if (data.data && Array.isArray(data.data)) {
          documents = data.data;
        } else if (data.documents && Array.isArray(data.documents)) {
          documents = data.documents;
        } else if (data.items && Array.isArray(data.items)) {
          documents = data.items;
        } else if (data.results && Array.isArray(data.results)) {
          documents = data.results;
        }
      }

      return documents;
    } catch (error) {
      console.error('Error loading documents tree:', error);
      throw error;
    }
  },

  getContent: async (slug: string): Promise<DocumentContent> => {
    try {
      const url = `${API_URL}/admin/docs/content/${slug}`;

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch document content for slug: ${slug}. Status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading document content:', error);
      throw error;
    }
  }
};
