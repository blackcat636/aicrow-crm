"use client"

export const runtime = 'edge';

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getColorById, updateColor } from "@/lib/api/colors"
import { Color, UpdateColorDto } from "@/interface/Color"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function EditColorPage() {
  const params = useParams()
  const router = useRouter()
  const [color, setColor] = useState<Color | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<UpdateColorDto>({
    id: 0,
    name: "",
    hexCode: "",
    description: ""
  })

  useEffect(() => {
    const fetchColor = async () => {
      try {
        const response = await getColorById(Number(params.id))
        if (response.status === 'success' || response.status === 200) {
          if (response.data) {
            setColor(response.data)
            setFormData({
              id: response.data.id,
              name: response.data.name,
              hexCode: response.data.hexCode,
              description: response.data.description || ""
            })
          }
        } else {
          toast.error("Error loading color")
        }
      } catch (error) {
        console.error('Error fetching color:', error)
        toast.error("Error loading color")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchColor()
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await updateColor(formData)
      
      if (response.status === 'success' || response.status === 200) {
        toast.success("Color updated successfully")
        router.push("/colors")
      } else {
        toast.error(response.message || "Error updating color")
      }
    } catch (error) {
      console.error('Error updating color:', error)
      toast.error("Error updating color")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto py-10">Loading...</div>
  }

  if (!color) {
    return <div className="container mx-auto py-10">Color not found</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit color</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="hexCode">Hex code</Label>
            <Input
              id="hexCode"
              value={formData.hexCode}
              onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
              placeholder="#000000"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/colors")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 