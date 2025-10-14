"use client"

import { useState } from 'react'
import { useInstancesStore } from '@/store/useInstancesStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { IconPlus, IconLoader2 } from '@tabler/icons-react'

export function CreateInstanceDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    apiUrl: '',
    apiKey: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { createInstance, isLoading } = useInstancesStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.apiUrl || !formData.apiKey) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const success = await createInstance({
        name: formData.name,
        apiUrl: formData.apiUrl,
        apiKey: formData.apiKey
      })
      
      if (success) {
        setFormData({ name: '', apiUrl: '', apiKey: '', description: '' })
        setOpen(false)
      }
    } catch (error) {
      console.error('Error creating instance:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="h-4 w-4 mr-2" />
          Add Instance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Instance</DialogTitle>
          <DialogDescription>
            Add a new n8n instance to manage workflows and executions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Instance Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Production n8n"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apiUrl">API URL *</Label>
              <Input
                id="apiUrl"
                value={formData.apiUrl}
                onChange={(e) => handleInputChange('apiUrl', e.target.value)}
                placeholder="https://n8n.example.com"
                type="url"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                value={formData.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="Your n8n API key"
                type="password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional description for this instance"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? (
                <>
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Instance'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
