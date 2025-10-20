"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { refreshTokenClient } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { 
  IconBook, 
  IconFileText, 
  IconChevronRight,
  IconChevronDown,
  IconLanguage,
  IconCalendar,
  IconFolder,
  IconLoader2,
  IconLogin
} from '@tabler/icons-react';

interface DocumentItem {
  title: string;
  type: 'category' | 'document';
  slug?: string;
  order?: number;
  languages?: string[];
  children?: DocumentItem[];
}

interface DocumentContent {
  metadata: {
  title: string;
    category: string;
    lastModified: string;
  language: string;
    path: string;
  slug: string;
  };
  html: string;
  toc: Array<{
    text: string;
    level: number;
    id: string;
    children: never[];
  }>;
  markdown: string;
}

export default function InteractiveDocumentation() {
  const router = useRouter();
  const [treeData, setTreeData] = useState<DocumentItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentContent | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  // Auto-redirect to login if authentication is completely failed
  useEffect(() => {
    if (needsLogin && !loading) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 5000); // Redirect after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [needsLogin, loading, router]);

  // Fetch documentation tree
  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/docs-tree', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          let errorData = {};
          let responseText = '';
          
          try {
            responseText = await response.text();
            
            if (responseText) {
              try {
                errorData = JSON.parse(responseText);
              } catch (parseError) {
                console.warn('⚠️ Could not parse error response as JSON:', parseError);
                errorData = { rawText: responseText };
              }
            }
          } catch (textError) {
            console.warn('⚠️ Could not read response text:', textError);
            errorData = { readError: textError instanceof Error ? textError.message : String(textError) };
          }
          
          console.error('❌ Tree API error:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            errorData,
            responseText: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
          });
          
          if (response.status === 401) {
            console.warn('⚠️ Token expired or invalid, attempting to refresh...');
            
            // Try to refresh the token
            const refreshSuccess = await refreshTokenClient();
            
            if (refreshSuccess) {
              const retryResponse = await fetch('/api/docs-tree', {
                credentials: 'include'
              });
              
              if (retryResponse.ok) {
                const retryResult = await retryResponse.json();
                const treeData = retryResult.data || retryResult;
                
                if (treeData && Array.isArray(treeData)) {
                  setTreeData(treeData);
                  if (treeData.length > 0) {
                    setExpandedCategories(new Set([treeData[0].title]));
                  }
                  setLoading(false);
                  return;
                }
              }
            }
            
            console.warn('⚠️ Token refresh failed, showing fallback documentation');
          setTreeData(getFallbackTreeData());
            setIsUsingFallback(true);
            setNeedsLogin(true);
          setLoading(false);
          return;
        }
        
          throw new Error(`Failed to fetch tree: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
        }
        
        const result = await response.json();
        
        const treeData = result.data || result;
        
        if (!treeData || !Array.isArray(treeData)) {
          console.warn('⚠️ Invalid tree data format:', treeData);
          setTreeData(getFallbackTreeData());
        } else {
          setTreeData(treeData);
        
        // Auto-expand first category
          if (treeData.length > 0) {
            setExpandedCategories(new Set([treeData[0].title]));
          }
        }
      } catch (err) {
        console.error('❌ Error fetching tree:', err);
        setError(err instanceof Error ? err.message : 'Failed to load documentation');
        setTreeData(getFallbackTreeData());
        setIsUsingFallback(true);
        setNeedsLogin(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, []);

  // Load specific document
  const loadDocument = async (slug: string) => {
    // Guard: remove Workflow Structure document completely
    if (slug === 'workflow_structure') {
      return; // silently ignore
    }
    try {
      setDocLoading(true);
      setSelectedSlug(slug);
      setError(null); 
      
      // Check if we're using fallback data and if the slug exists
      if (isUsingFallback) {
        const fallbackData = getFallbackTreeData();
        const documentInfo = fallbackData
          .flatMap(category => category.children || [])
          .find(doc => doc.slug === slug);
        
        if (!documentInfo) {
          throw new Error(`Document "${slug}" is not available in offline mode. Please check your connection and try again.`);
        }
        
        // Check if the requested language is available for this document
        if (!documentInfo.languages?.includes(currentLanguage)) {
          const fallbackContent: DocumentContent = {
            metadata: {
              title: documentInfo.title,
              category: 'General',
              lastModified: new Date().toISOString(),
              language: currentLanguage,
              path: `${slug}.md`,
              slug: slug
            },
            html: `
              <div class="prose prose-sm max-w-none">
                <h1>${documentInfo.title}</h1>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p class="text-blue-800 text-sm">
                    <strong>Language Not Available:</strong> This document is not available in "${currentLanguage}" language. 
                    Available languages: ${documentInfo.languages?.join(', ') || 'en'}
                  </p>
                </div>
                <p>This document contains important information about the system architecture and implementation details.</p>
                <h2>Available Actions</h2>
                <ul>
                  <li>Switch to an available language using the language selector</li>
                  <li>Check your internet connection and try again when online</li>
                  <li>Contact your administrator if the problem persists</li>
                </ul>
              </div>
            `,
            toc: [
              { text: documentInfo.title, level: 1, id: 'document-title', children: [] },
              { text: 'Available Actions', level: 2, id: 'available-actions', children: [] }
            ],
            markdown: `# ${documentInfo.title}\n\n**Language Not Available:** This document is not available in "${currentLanguage}" language.\n\n## Available Actions\n- Switch to an available language using the language selector\n- Check your internet connection and try again when online\n- Contact your administrator if the problem persists`
          };
          
          setSelectedDocument(fallbackContent);
          setDocLoading(false);
          return;
        }
        
        const fallbackContent: DocumentContent = {
          metadata: {
            title: documentInfo.title,
            category: 'General',
            lastModified: new Date().toISOString(),
            language: currentLanguage,
            path: `${slug}.md`,
            slug: slug
          },
          html: `
            <div class="prose prose-sm max-w-none">
              <h1>${documentInfo.title}</h1>
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p class="text-yellow-800 text-sm">
                  <strong>Offline Mode:</strong> This document is not available in offline mode. 
                  Please check your internet connection and try again when online.
                </p>
              </div>
              <p>This document contains important information about the system architecture and implementation details.</p>
              <h2>Available Actions</h2>
              <ul>
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Contact your administrator if the problem persists</li>
              </ul>
            </div>
          `,
          toc: [
            { text: documentInfo.title, level: 1, id: 'document-title', children: [] },
            { text: 'Available Actions', level: 2, id: 'available-actions', children: [] }
          ],
          markdown: `# ${documentInfo.title}\n\n**Offline Mode:** This document is not available in offline mode.\n\n## Available Actions\n- Check your internet connection\n- Try refreshing the page\n- Contact your administrator if the problem persists`
        };
        
        setSelectedDocument(fallbackContent);
        setDocLoading(false);
        return;
      }
      
      // For online mode, check if the document supports the current language before making API call
      const fallbackData = getFallbackTreeData();
      const documentInfo = fallbackData
        .flatMap(category => category.children || [])
        .find(doc => doc.slug === slug);
      
      if (documentInfo && !documentInfo.languages?.includes(currentLanguage)) {
        const availableLanguages = documentInfo.languages?.join(', ') || 'en';
        
        // Show fallback content instead of throwing error
        const fallbackContent: DocumentContent = {
          metadata: {
            title: documentInfo.title,
            category: 'General',
            lastModified: new Date().toISOString(),
            language: currentLanguage,
            path: `${slug}.md`,
            slug: slug
          },
          html: `
            <div class="prose prose-sm max-w-none">
              <h1>${documentInfo.title}</h1>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p class="text-blue-800 text-sm">
                  <strong>Language Not Available:</strong> This document is not available in "${currentLanguage}" language. 
                  Available languages: ${availableLanguages}
                </p>
              </div>
              <p>This document contains important information about the system architecture and implementation details.</p>
              <h2>Available Actions</h2>
              <ul>
                <li>Switch to an available language using the language selector above</li>
                <li>Check your internet connection and try again when online</li>
                <li>Contact your administrator if the problem persists</li>
              </ul>
                  <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600">
                      <strong>Tip:</strong> Use the language selector in the sidebar to switch to English (en) to view this document.
                    </p>
                    <div class="mt-2">
                      <button onclick="document.querySelector('[data-language=en]')?.click()" class="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded border border-blue-300 transition-colors">
                        Switch to English
                      </button>
                    </div>
                  </div>
            </div>
          `,
          toc: [
            { text: documentInfo.title, level: 1, id: 'document-title', children: [] },
            { text: 'Available Actions', level: 2, id: 'available-actions', children: [] }
          ],
          markdown: `# ${documentInfo.title}\n\n**Language Not Available:** This document is not available in "${currentLanguage}" language.\n\n## Available Actions\n- Switch to an available language using the language selector above\n- Check your internet connection and try again when online\n- Contact your administrator if the problem persists\n\n**Tip:** Use the language selector in the sidebar to switch to English (en) to view this document.`
        };
        
        setSelectedDocument(fallbackContent);
        setDocLoading(false);
        return;
      }
      
      const response = await fetch(`/api/docs-content?slug=${slug}&language=${currentLanguage}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        let errorData = {};
        try {
          const responseText = await response.text();
          if (responseText) {
            errorData = JSON.parse(responseText);
          }
        } catch {
          console.warn('⚠️ Could not parse document error response as JSON');
        }
        
        console.error('❌ Document API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        if (response.status === 401) {
          console.warn('⚠️ Document request: Token expired, attempting to refresh...');
          
          // Try to refresh the token
          const refreshSuccess = await refreshTokenClient();
          
          if (refreshSuccess) {
            // Retry the request with the new token
            const retryResponse = await fetch(`/api/docs-content?slug=${slug}&language=${currentLanguage}`, {
              credentials: 'include'
            });
            
            if (retryResponse.ok) {
              const retryResult = await retryResponse.json();
              const docData = retryResult.data || retryResult;
              
              if (docData) {
                setSelectedDocument(docData);
                setDocLoading(false);
                return;
              }
            }
          }
          
          throw new Error('Your session has expired. Please refresh the page and log in again.');
        }
        
        if (response.status === 403) {
          throw new Error('Insufficient permissions to access this document. Please contact your administrator.');
        }
        
        // Handle 404 errors with more specific messaging
        if (response.status === 404) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || 'Document not found';
          
          // Check if it's a language-specific 404
          if (errorMessage.includes('not found for language')) {
            const languageMatch = errorMessage.match(/language "([^"]+)"/);
            const requestedLanguage = languageMatch ? languageMatch[1] : currentLanguage;
            
            // Find the document in fallback data to get available languages
            const fallbackData = getFallbackTreeData();
            const documentInfo = fallbackData
              .flatMap(category => category.children || [])
              .find(doc => doc.slug === slug);
            
            if (documentInfo && documentInfo.languages) {
              const availableLanguages = documentInfo.languages.join(', ');
              throw new Error(`Document "${slug}" is not available in "${requestedLanguage}" language. Available languages: ${availableLanguages}. Please switch to an available language using the language selector.`);
            } else {
              throw new Error(`Document "${slug}" not found for language "${requestedLanguage}". It may have been moved or deleted.`);
            }
          } else {
            throw new Error(`Document "${slug}" not found. It may have been moved or deleted.`);
          }
        }
        
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
      }
      
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response:', jsonError);
        const responseText = await response.text().catch(() => 'Could not read response text');
        throw new Error(`Invalid JSON response from API: ${responseText.substring(0, 200)}`);
      }
      
      // Validate the response structure
      if (!result || typeof result !== 'object') {
        console.warn('⚠️ Invalid API response format:', result);
        throw new Error('Invalid API response format received');
      }
      
      const docData = result.data || result;
      
      if (!docData || typeof docData !== 'object') {
        console.warn('⚠️ Invalid document data format:', docData);
        throw new Error('Invalid document data received from API');
      }
      
      // Check if the document data has required fields
      if (!docData.metadata && !docData.html && !docData.markdown) {
        console.warn('⚠️ Document data missing required fields:', docData);
        throw new Error('Document data is missing required fields (metadata, html, or markdown)');
      }
      
      setSelectedDocument(docData);
    } catch (err) {
      console.error('❌ Error loading document:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err,
        slug: slug,
        language: currentLanguage
      });
      const errorMessage = err instanceof Error ? err.message : 'Failed to load document';
      
      // Check if it's a language-specific error and show fallback content
      if (errorMessage.includes('not available in') && errorMessage.includes('language')) {
        
        // Extract document info from error message
        const slugMatch = errorMessage.match(/Document "([^"]+)"/);
        const languageMatch = errorMessage.match(/not available in "([^"]+)"/);
        const availableLanguagesMatch = errorMessage.match(/Available languages: ([^.]+)/);
        
        if (slugMatch) {
          const documentSlug = slugMatch[1];
          const requestedLanguage = languageMatch ? languageMatch[1] : currentLanguage;
          const availableLanguages = availableLanguagesMatch ? availableLanguagesMatch[1] : 'en';
          
          // Find document info from fallback data
          const fallbackData = getFallbackTreeData();
          const documentInfo = fallbackData
            .flatMap(category => category.children || [])
            .find(doc => doc.slug === documentSlug);
          
          if (documentInfo) {
            const fallbackContent: DocumentContent = {
              metadata: {
                title: documentInfo.title,
                category: 'General',
                lastModified: new Date().toISOString(),
                language: requestedLanguage,
                path: `${documentSlug}.md`,
                slug: documentSlug
              },
              html: `
                <div class="prose prose-sm max-w-none">
                  <h1>${documentInfo.title}</h1>
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p class="text-blue-800 text-sm">
                      <strong>Language Not Available:</strong> This document is not available in "${requestedLanguage}" language. 
                      Available languages: ${availableLanguages}
                    </p>
                  </div>
                  <p>This document contains important information about the system architecture and implementation details.</p>
                  <h2>Available Actions</h2>
                  <ul>
                    <li>Switch to an available language using the language selector above</li>
                    <li>Check your internet connection and try again when online</li>
                    <li>Contact your administrator if the problem persists</li>
                  </ul>
                  <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600">
                      <strong>Tip:</strong> Use the language selector in the sidebar to switch to an available language to view this document.
                    </p>
                    <div class="mt-2">
                      <button onclick="document.querySelector('[data-language=en]')?.click()" class="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded border border-blue-300 transition-colors">
                        Switch to English
                      </button>
                    </div>
                  </div>
                </div>
              `,
              toc: [
                { text: documentInfo.title, level: 1, id: 'document-title', children: [] },
                { text: 'Available Actions', level: 2, id: 'available-actions', children: [] }
              ],
              markdown: `# ${documentInfo.title}\n\n**Language Not Available:** This document is not available in "${requestedLanguage}" language.\n\n## Available Actions\n- Switch to an available language using the language selector above\n- Check your internet connection and try again when online\n- Contact your administrator if the problem persists\n\n**Tip:** Use the language selector in the sidebar to switch to an available language to view this document.`
            };
            
            setSelectedDocument(fallbackContent);
            setDocLoading(false);
            return;
          }
        }
      }
      
      // Check if it's an API error (empty object or invalid response)
      if (errorMessage.includes('Invalid JSON response') || errorMessage.includes('Invalid API response format') || errorMessage.includes('Invalid document data')) {
        
        // Find document info from fallback data
        const fallbackData = getFallbackTreeData();
        const documentInfo = fallbackData
          .flatMap(category => category.children || [])
          .find(doc => doc.slug === slug);
        
        if (documentInfo) {
          const fallbackContent: DocumentContent = {
            metadata: {
              title: documentInfo.title,
              category: 'General',
              lastModified: new Date().toISOString(),
              language: currentLanguage,
              path: `${slug}.md`,
              slug: slug
            },
            html: `
              <div class="prose prose-sm max-w-none">
                <h1>${documentInfo.title}</h1>
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p class="text-red-800 text-sm">
                    <strong>API Error:</strong> There was an issue retrieving this document from the server. 
                    The API returned invalid or empty data.
                  </p>
                </div>
                <p>This document contains important information about the system architecture and implementation details.</p>
                <h2>Available Actions</h2>
                <ul>
                  <li>Try refreshing the page</li>
                  <li>Check your internet connection</li>
                  <li>Contact your administrator if the problem persists</li>
                </ul>
                <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-600">
                    <strong>Error Details:</strong> ${errorMessage}
                  </p>
                  <div class="mt-2">
                    <button onclick="window.location.reload()" class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs rounded border border-red-300 transition-colors">
                      Refresh Page
                    </button>
                  </div>
                </div>
              </div>
            `,
            toc: [
              { text: documentInfo.title, level: 1, id: 'document-title', children: [] },
              { text: 'Available Actions', level: 2, id: 'available-actions', children: [] }
            ],
            markdown: `# ${documentInfo.title}\n\n**API Error:** There was an issue retrieving this document from the server.\n\n## Available Actions\n- Try refreshing the page\n- Check your internet connection\n- Contact your administrator if the problem persists\n\n**Error Details:** ${errorMessage}`
          };
          
          setSelectedDocument(fallbackContent);
          setDocLoading(false);
          return;
        }
      }
      
      setError(errorMessage);
    } finally {
      setDocLoading(false);
    }
  };

  const toggleCategory = (categoryTitle: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryTitle)) {
      newExpanded.delete(categoryTitle);
    } else {
      newExpanded.add(categoryTitle);
    }
    setExpandedCategories(newExpanded);
  };

  const getFallbackTreeData = (): DocumentItem[] => [
    {
      title: "General",
      type: "category",
      order: 1,
      languages: ["en", "ua"],
      children: [
        {
          title: "CRM API Documentation",
          type: "document",
          slug: "general_api",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "API Usage Examples",
          type: "document",
          slug: "general_api_postman",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Swagger Documentation",
          type: "document",
          slug: "general_swagger_documentation",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Модульний моноліт - Архітектура",
          type: "document",
          slug: "general_modular_architecture",
          order: 999,
          languages: ["en"]
        },
        {
          title: "AiPills CRM Project Architecture Analysis",
          type: "document",
          slug: "general_project_architecture_analysis",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "React Components для інтеграції з адмінкою",
          type: "document",
          slug: "general_react_components_example",
          order: 999,
          languages: ["en"]
        },
        {
          title: "CRM Backend - Modular Monolith",
          type: "document",
          slug: "general_readme",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Оновлення безпеки: Захист Swagger та документації",
          type: "document",
          slug: "general_security_update",
          order: 999,
          languages: ["en"]
        },
        {
          title: "Testing Examples",
          type: "document",
          slug: "general_testing_examples",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Testing Guide",
          type: "document",
          slug: "general_testing_guide",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Testing Documentation",
          type: "document",
          slug: "general_testing_readme",
          order: 999,
          languages: ["en", "ua"]
        }
      ]
    },
    {
      title: "Core",
      type: "category",
      order: 2,
      languages: ["en", "ua"],
      children: [
        {
          title: "Permissions System",
          type: "document",
          slug: "core_permissions_readme",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "User Management",
          type: "document",
          slug: "core_user_profile_api",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Telegram Module",
          type: "document",
          slug: "core_readme",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Confirmation Code System",
          type: "document",
          slug: "core_token_system",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Email Message Examples",
          type: "document",
          slug: "core_email-examples",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Стратегія інвалідації кешу при нових записах",
          type: "document",
          slug: "core_cache-invalidation-strategy",
          order: 999,
          languages: ["en"]
        },
        {
          title: "Documentation Consolidation Summary",
          type: "document",
          slug: "core_.consolidation-summary",
          order: 999,
          languages: ["en"]
        },
        {
          title: "Integration Guide",
          type: "document",
          slug: "core_integration_guide",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Permissions System API Documentation",
          type: "document",
          slug: "core_permissions_api",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Permissions System - Usage Examples",
          type: "document",
          slug: "core_permissions_examples",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Система прав - Приклади використання",
          type: "document",
          slug: "core_usage-example",
          order: 999,
          languages: ["en"]
        },
        {
          title: "User Structure API Documentation",
          type: "document",
          slug: "core_user_structure_api",
          order: 999,
          languages: ["en", "ua"]
        }
      ]
    },
    {
      title: "Plugins",
      type: "category",
      order: 3,
      languages: ["en", "ua"],
      children: [
        {
          title: "Balance Module",
          type: "document",
          slug: "plugins_readme",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Stripe Integration",
          type: "document",
          slug: "plugins_stripe_integration",
          order: 999,
          languages: ["en", "ua"]
        },
        {
          title: "Payment Methods Documentation",
          type: "document",
          slug: "plugins_payment_methods",
          order: 999,
          languages: ["en", "ua"]
        }
      ]
    },
    {
      title: "Migrations",
      type: "category",
      order: 4,
      languages: ["en", "ua"],
      children: [
        {
          title: "Initial Super Admin Migration",
          type: "document",
          slug: "migrations_readme_initial_admin",
          order: 999,
          languages: ["en", "ua"]
        }
      ]
    },
    {
      title: "Shared",
      type: "category",
      order: 5,
      languages: ["en", "ua"],
      children: [
        {
          title: "Technical Module",
          type: "document",
          slug: "shared_readme",
          order: 999,
          languages: ["en", "ua"]
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-6 bg-primary/10 rounded-full">
            <IconLoader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-xl mb-2">Loading Documentation</h3>
            <p className="text-muted-foreground">Fetching the latest documentation structure...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full">
      {/* Sidebar */}
      <div className="w-80 border-r bg-gradient-to-b from-background to-muted/30 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconBook className="h-5 w-5 text-primary" />
            </div>
          <div>
              <h2 className="text-xl font-bold">Documentation</h2>
              <p className="text-sm text-muted-foreground">API & Guides</p>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="bg-card border rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <IconLanguage className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Language</span>
            </div>
            <select 
              value={currentLanguage} 
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="w-full text-sm border rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="en">🇺🇸 English</option>
              <option value="ua">🇺🇦 Українська</option>
            </select>
          </div>
        </div>
        
        {/* Navigation Tree */}
        <div className="space-y-1">
          {treeData.map((category) => (
            <div key={category.title} className="space-y-1">
              {/* Category Header */}
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto hover:bg-primary/10 transition-colors"
                onClick={() => toggleCategory(category.title)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="p-1 rounded-md bg-muted">
                    {expandedCategories.has(category.title) ? (
                      <IconChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-1 rounded-md bg-primary/10">
                    <IconFolder className="h-4 w-4 text-primary" />
            </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium text-sm">{category.title}</span>
                    {category.children && (
                      <div className="text-xs text-muted-foreground">
                        {category.children.length} documents
                      </div>
                    )}
                  </div>
                </div>
              </Button>
              
              {/* Documents */}
              {expandedCategories.has(category.title) && category.children && (
                <div className="ml-4 space-y-1 border-l-2 border-muted pl-4">
                  {category.children
                    .filter((doc) => doc?.title !== 'Workflow Structure' && doc?.slug !== 'workflow_structure')
                    .map((doc) => (
                    <Button
                      key={doc.slug}
                      variant="ghost"
                      className={`w-full justify-start p-3 h-auto text-sm transition-all duration-200 ${
                        selectedSlug === doc.slug 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => doc.slug && loadDocument(doc.slug)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className={`p-1 rounded-md ${
                          selectedSlug === doc.slug 
                            ? 'bg-primary-foreground/20' 
                            : 'bg-muted'
                        }`}>
                          <IconFileText className={`h-4 w-4 ${
                            selectedSlug === doc.slug 
                              ? 'text-primary-foreground' 
                              : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="truncate font-medium">{doc.title}</div>
                          {doc.languages && doc.languages.length > 1 && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Badge 
                                variant="secondary" 
                                className="text-xs px-2 py-0.5"
                              >
                                {doc.languages.length} langs
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <IconBook className="h-3 w-3" />
              <span>AICrow CRM Docs</span>
            </div>
            <div>Last updated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-background to-muted/20 overflow-y-auto">
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
              <div className="text-red-800 text-sm font-medium mb-2">{error}</div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    setError(null);
                    setSelectedDocument(null);
                    setSelectedSlug(null);
                  }}
                  variant="outline" 
                  size="sm"
                  className="bg-red-100 hover:bg-red-200 border-red-300"
                >
                  Back to Documentation
                </Button>
                {error.includes('not found') && (
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline" 
                    size="sm"
                    className="bg-red-100 hover:bg-red-200 border-red-300"
                  >
                    Refresh Page
                  </Button>
                )}
              </div>
            </div>
          )}

          {isUsingFallback && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
              <div className="text-yellow-800 text-sm font-medium">
                ⚠️ Using offline documentation. Some features may be limited.
              </div>
              <div className="text-yellow-700 text-xs mt-1">
                This may be due to expired authentication. Try refreshing the page or logging in again.
              </div>
              {needsLogin && (
                <div className="mt-3 space-y-2">
                  <Button 
                    onClick={() => router.push('/login')}
                    variant="outline" 
                    size="sm"
                    className="bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
                  >
                    <IconLogin className="h-4 w-4 mr-2" />
                    Go to Login
                  </Button>
                  <div className="text-xs text-yellow-600">
                    You will be automatically redirected to login in a few seconds...
                  </div>
                </div>
              )}
            </div>
          )}

          {docLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Loading document...</h3>
                  <p className="text-muted-foreground">Please wait while we fetch the content</p>
                </div>
                </div>
              </div>
            ) : selectedDocument ? (
            <div className="max-w-4xl mx-auto">
              {/* Document Header */}
              <div className="mb-8">
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {selectedDocument.metadata.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-full">
                      <IconBook className="h-4 w-4" />
                      <span className="font-medium">{selectedDocument.metadata.category}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-full">
                      <IconLanguage className="h-4 w-4" />
                      <span>{selectedDocument.metadata.language.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-full">
                      <IconCalendar className="h-4 w-4" />
                      <span>{new Date(selectedDocument.metadata.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="bg-card border rounded-xl p-8 shadow-sm">
                  <div 
                  className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:border"
                  dangerouslySetInnerHTML={{ __html: selectedDocument.html }}
                  />
                </div>
              </div>
            ) : (
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center max-w-md">
                <div className="p-6 bg-primary/10 rounded-full w-fit mx-auto mb-6">
                  <IconBook className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Welcome to Documentation</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Choose a document from the sidebar to start exploring our comprehensive guides and API references.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <IconFolder className="h-4 w-4" />
                    <span className="font-medium">Available Categories:</span>
                  </div>
                  <div className="space-y-1">
                    {treeData.map((category) => (
                      <div key={category.title} className="flex items-center justify-between">
                        <span>{category.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.children?.length || 0} docs
                        </Badge>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}