"use client"
export const runtime = 'edge';

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DocumentTree, DocumentContent } from "@/interface/Document"
import { documentsApi } from "@/lib/api/documents"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconFileText, IconFolder, IconChevronRight } from "@tabler/icons-react"

export default function DocumentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [documents, setDocuments] = useState<DocumentTree[]>([])
  const [selectedContent, setSelectedContent] = useState<DocumentContent | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Function to expand parent categories for a given slug
  const expandParentCategories = useCallback((targetSlug: string) => {
    const findParents = (items: DocumentTree[], target: string, parents: string[] = []): string[] => {
      for (const item of items) {
        const itemSlug = item.slug || generateSlug(item.title)
        if (itemSlug === target) {
          return parents
        }
        if (item.children) {
          // Check if target is in children (as string or object)
          const hasTarget = item.children.some(child => {
            if (typeof child === 'string') {
              return child === target
            } else {
              const childSlug = child.slug || generateSlug(child.title)
              return childSlug === target
            }
          })
          
          if (hasTarget) {
            return [...parents, itemSlug]
          }
          
          // Recursively search in child objects
          const childObjects = item.children
            .filter(child => typeof child === 'object')
            .map(child => child as DocumentTree)
          
          const found = findParents(childObjects, target, [...parents, itemSlug])
          if (found.length > 0) {
            return found
          }
        }
      }
      return []
    }

    const parents = findParents(documents, targetSlug)
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      parents.forEach(parent => newSet.add(parent))
      return newSet
    })
  }, [documents])

  const handleDocumentClick = useCallback(async (slug: string) => {
    try {
      
      setSelectedSlug(slug)
      setIsLoadingContent(true)
      
      // Update URL
      const newUrl = `/documents?slug=${encodeURIComponent(slug)}`
      router.push(newUrl, { scroll: false })
      const content = await documentsApi.getContent(slug)
      setSelectedContent(content)
    } catch (error) {
      console.error('❌ Error fetching document content:', error)
      // Clear URL on error
      router.push('/documents', { scroll: false })
    } finally {
      setIsLoadingContent(false)
    }
  }, [router])

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true)
        const data = await documentsApi.getTree()
        setDocuments(data)
      } catch (error) {
        console.error('❌ Error fetching documents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  // Handle URL parameter changes
  useEffect(() => {
    const slug = searchParams.get('slug')
    if (slug && slug !== selectedSlug) {
      // Auto-expand parent categories
      expandParentCategories(slug)
      handleDocumentClick(slug)
    }
  }, [searchParams, selectedSlug, expandParentCategories, handleDocumentClick])

  const toggleExpanded = (slug: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(slug)) {
        newSet.delete(slug)
      } else {
        newSet.add(slug)
      }
      return newSet
    })
  }

  // Function to generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  const renderDocumentTree = (items: DocumentTree[], level = 0) => {
    return items
      .map((item, index) => {
        // Generate slug if missing
        const slug = item.slug || generateSlug(item.title)
        
        const isExpanded = expandedItems.has(slug)
        const hasChildren = item.children && item.children.length > 0

        return (
        <div key={`${slug}-${level}-${index}`} className="ml-4">
          <div className="flex items-center space-x-2 py-2">
            {hasChildren ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-auto"
                onClick={() => toggleExpanded(slug)}
              >
                <IconChevronRight 
                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                />
              </Button>
            ) : (
              <div className="w-6" />
            )}
            
            <div 
              className={`flex items-center space-x-2 flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded ${
                selectedSlug === slug ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => {
                if (item.type === 'document') {
                  handleDocumentClick(slug)
                } else if (item.type === 'category' && hasChildren) {
                  toggleExpanded(slug)
                }
              }}
            >
              {item.type === 'category' ? (
                <IconFolder className="h-4 w-4 text-blue-500" />
              ) : (
                <IconFileText className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium">{item.title}</span>
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="ml-6">
              {(() => {                
                const childItems = item.children.map(child => {
                  // If child is already an object, use it directly
                  if (typeof child === 'object' && child !== null) {
                    return child as DocumentTree
                  }
                  
                  // If child is a string slug, try to find it
                  const childSlug = String(child)
                  let found = documents.find(doc => doc.slug === childSlug)
                  if (!found) {
                    found = documents.find(doc => (doc.slug || generateSlug(doc.title)) === childSlug)
                  }
                  if (!found) {
                    found = documents.find(doc => doc.title === childSlug)
                  }
                  return found
                }).filter(Boolean) as DocumentTree[]
                
                return renderDocumentTree(childItems, level + 1)
              })()}
            </div>
          )}
        </div>
        )
      })
      .filter(Boolean) // Remove null items
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Documents</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Tree */}
        <Card>
          <CardHeader>
            <CardTitle>Document Tree</CardTitle>
            <CardDescription>
              Browse through the available documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {renderDocumentTree(documents)}
            </div>
          </CardContent>
        </Card>

        {/* Document Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedContent?.metadata.title || 'Select a document'}
            </CardTitle>
            <CardDescription>
              {selectedContent?.metadata.description || 'Choose a document from the tree to view its content'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingContent ? (
              <div className="text-center text-gray-500 py-8">
                Loading content...
              </div>
            ) : selectedContent ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p><strong>Category:</strong> {selectedContent.metadata.category}</p>
                  <p><strong>Language:</strong> {selectedContent.metadata.language}</p>
                  <p><strong>Last Modified:</strong> {new Date(selectedContent.metadata.lastModified).toLocaleDateString()}</p>
                </div>
                
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedContent.html }}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No document selected
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
