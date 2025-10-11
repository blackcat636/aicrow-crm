"use client";

import React, { useState, useEffect } from 'react';

interface DocumentItem {
  title: string;
  type: 'document';
  slug: string;
  order: number;
  languages: string[];
}

interface Category {
  title: string;
  type: 'category';
  children: DocumentItem[];
  order: number;
  languages: string[];
}

interface DocumentContent {
  title: string;
  content: string;
  language: string;
  slug: string;
}

export default function InteractiveDocumentation() {
  const [treeData, setTreeData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentContent | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Fetch documentation tree
  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/docs-tree');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Tree API error:', errorData);
          
        if (response.status === 403) {
          // Show fallback documentation for 403 errors
          setTreeData(getFallbackTreeData());
          setLoading(false);
          return;
        }
        
        throw new Error(`Failed to fetch tree: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        setTreeData(result.data);
        
        // Auto-expand first category
        if (result.data.length > 0) {
          setExpandedCategories([result.data[0].title]);
        }
      } catch (err) {
        console.error('❌ Error fetching tree:', err);
        setError(err instanceof Error ? err.message : 'Failed to load documentation');
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, []);

  // Load specific document
  const loadDocument = async (slug: string) => {
    try {
      setDocumentLoading(true);
      const response = await fetch(`/api/docs-document?slug=${slug}&language=${currentLanguage}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Document API error:', errorData);
        
        if (response.status === 403) {
          throw new Error('Insufficient permissions to access this document. Please contact your administrator.');
        }
        
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Handle the actual API response format
      if (result.data && result.data.html) {
        setSelectedDocument({
          title: result.data.metadata?.title || slug,
          content: result.data.html, // Use the pre-rendered HTML
          language: currentLanguage,
          slug: slug
        });
      } else {
        setSelectedDocument(result.data);
      }
    } catch (err) {
      console.error('❌ Error loading document:', err);
      
      // Show fallback content for documents
      const fallbackContent = getFallbackDocumentContent(slug);
      setSelectedDocument({
        title: fallbackContent.title,
        content: fallbackContent.content,
        language: currentLanguage,
        slug: slug
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  // Toggle category expansion
  const toggleCategory = (categoryTitle: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryTitle) 
        ? prev.filter(title => title !== categoryTitle)
        : [...prev, categoryTitle]
    );
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
    // Reload current document if one is selected
    if (selectedDocument) {
      loadDocument(selectedDocument.slug);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <div className="text-sm text-muted-foreground">Loading documentation...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 mb-4 text-4xl">🔒</div>
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <div className="text-sm text-muted-foreground mb-4">
            {error}
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            Your account may not have the required permissions to view documentation.
            Please contact your system administrator to request access.
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 mr-2"
            >
              Retry
            </button>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 mt-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Documentation</h1>
            <p className="text-muted-foreground">
              Interactive API documentation and guides
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 pb-2 md:gap-6 md:pb-3 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <div className="w-[30%] min-w-[300px] bg-background border rounded-lg p-4 flex flex-col overflow-y-auto">
            <div className="mb-4">
              <h3 className="font-semibold mb-2">📚 Documentation</h3>
              <select 
                value={currentLanguage} 
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="en">English</option>
                <option value="ua">Українська</option>
              </select>
            </div>
            
            <div className="space-y-2">
              {treeData.map((category) => {
                const isExpanded = expandedCategories.includes(category.title);
                
                return (
                  <div key={category.title} className="border rounded-md">
                    <button
                      onClick={() => toggleCategory(category.title)}
                      className="w-full p-3 text-left bg-primary text-primary-foreground rounded-t-md hover:bg-primary/90 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span>{isExpanded ? '▼' : '▶'}</span>
                        <span>📁 {category.title}</span>
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div className="p-2 space-y-1">
                        {category.children.map((doc) => (
                          <button
                            key={doc.slug}
                            onClick={() => loadDocument(doc.slug)}
                            className={`w-full p-2 text-left rounded text-sm transition-colors ${
                              selectedDocument?.slug === doc.slug
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            📄 {doc.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Content Area */}
          <div className="w-[70%] bg-background border rounded-lg p-6 flex flex-col overflow-y-auto">
            {documentLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <div className="text-sm text-muted-foreground">Loading document...</div>
                </div>
              </div>
            ) : selectedDocument ? (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">{selectedDocument.title}</h2>
                  <div className="text-sm text-muted-foreground">
                    Language: {selectedDocument.language} | Slug: {selectedDocument.slug}
                  </div>
                </div>
                <div className="prose max-w-none flex-1 overflow-y-auto">
                  <div 
                    className="document-content-html prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-md prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic"
                    dangerouslySetInnerHTML={{ __html: selectedDocument.content || 'No content available.' }} 
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-lg font-semibold mb-2">Welcome to AiCrow CRM Documentation</h3>
                <p className="text-muted-foreground mb-4">
                  Select a document from the sidebar to view its content.
                </p>
                <div className="text-left max-w-md mx-auto">
                  <h4 className="font-medium mb-2">Quick Links:</h4>
                  <div className="space-y-1">
                    {treeData.flatMap(cat => cat.children).slice(0, 4).map((doc) => (
                      <button
                        key={doc.slug}
                        onClick={() => loadDocument(doc.slug)}
                        className="block w-full text-left text-primary hover:underline text-sm"
                      >
                        {doc.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// Fallback tree data when API is not accessible
function getFallbackTreeData(): Category[] {
  return [
    {
      title: "General",
      type: "category",
      children: [
        {
          title: "Module System Documentation",
          type: "document",
          slug: "module_system",
          order: 1,
          languages: ["en", "ua"]
        },
        {
          title: "API Overview",
          type: "document",
          slug: "api_overview",
          order: 2,
          languages: ["en", "ua"]
        }
      ],
      order: 1,
      languages: ["en", "ua"]
    },
    {
      title: "Core",
      type: "category",
      children: [
        {
          title: "Authentication Guide",
          type: "document",
          slug: "auth_guide",
          order: 1,
          languages: ["en", "ua"]
        },
        {
          title: "Permissions System",
          type: "document",
          slug: "permissions",
          order: 2,
          languages: ["en", "ua"]
        }
      ],
      order: 2,
      languages: ["en", "ua"]
    }
  ];
}

// Fallback document content when API is not accessible
function getFallbackDocumentContent(slug: string): { title: string; content: string } {
  const fallbackDocs: Record<string, { title: string; content: string }> = {
    module_system: {
      title: "Module System Documentation",
      content: `# Module System Documentation

This is fallback documentation for the module system.

## Overview
The module system allows for dynamic loading and management of application modules.

## Features
- Dynamic module loading
- Permission-based access control
- Module state management

## Usage
Modules are loaded dynamically based on user permissions and system configuration.

Note: This is fallback content. The actual documentation requires proper API access.`
    },
    api_overview: {
      title: "API Overview",
      content: `# API Overview

This is fallback documentation for the API overview.

## Endpoints
- /api/modules/active - Get active modules
- /api/docs-tree - Get documentation tree
- /api/docs-document - Get specific document

## Backend API Endpoints
- /admin/docs/tree - Get documentation tree structure
- /admin/docs/content/{slug} - Get specific document content

## Authentication
All API endpoints require proper JWT authentication.

Note: This is fallback content. The actual documentation requires proper API access.`
    },
    auth_guide: {
      title: "Authentication Guide",
      content: `# Authentication Guide

This is fallback documentation for authentication.

## JWT Tokens
Authentication is handled via JWT tokens stored in cookies.

## Permissions
The system uses role-based permissions for access control.

Note: This is fallback content. The actual documentation requires proper API access.`
    },
    permissions: {
      title: "Permissions System",
      content: `# Permissions System

This is fallback documentation for the permissions system.

## Roles
- Admin: Full access
- User: Limited access
- Guest: Read-only access

## Module Permissions
Each module has specific permissions (can_view, can_edit, can_delete).

Note: This is fallback content. The actual documentation requires proper API access.`
    }
  };

  return fallbackDocs[slug] || {
    title: slug,
    content: `# ${slug}

This is fallback documentation for ${slug}.

Note: This is fallback content. The actual documentation requires proper API access.

Error: Unable to load document "${slug}" from the API. Please check your permissions or contact your administrator.`
  };
}

