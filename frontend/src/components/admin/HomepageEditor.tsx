import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import SplatViewer from '../SplatViewer';
import { 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Star, 
  Edit2,
  Eye,
  Globe,
  Upload,
  X,
  ExternalLink
} from 'lucide-react';

interface HomepageHeroContent {
  headline: string;
  subheadline: string;
  hero_image_base64?: string;
  primary_cta_text: string;
  primary_cta_url: string;
  secondary_cta_text: string;
  secondary_cta_url: string;
}

interface HomepageFeature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface HomepageTestimonial {
  name: string;
  title: string;
  avatar_url?: string;
  rating: number;
  quote: string;
}

interface HomepageDemoItem {
  name: string;
  description: string;
  image_base64?: string;
  menu_link: string;
  emoji: string;
}

interface HomepageContent {
  hero: HomepageHeroContent;
  features: HomepageFeature[];
  testimonials: HomepageTestimonial[];
  demo_items: HomepageDemoItem[];
}

const HomepageEditor = () => {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  useEffect(() => {
    loadHomepageContent();
  }, []);

  const loadHomepageContent = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/homepage/content`);
      
      if (!response.ok) {
        throw new Error('Failed to load homepage content');
      }
      
      const data = await response.json();
      setContent(data);
    } catch (error) {
      toast({
        title: "Error loading homepage content",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveHomepageContent = async () => {
    if (!content) return;
    
    try {
      setSaving(true);
      const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/homepage/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save homepage content');
      }
      
      toast({
        title: "Homepage content saved",
        description: "Your changes have been saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error saving homepage content",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setSaving(true);
      const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/homepage/content/reset`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset homepage content');
      }
      
      const data = await response.json();
      setContent(data);
      
      toast({
        title: "Homepage content reset",
        description: "Content has been reset to default values.",
      });
    } catch (error) {
      toast({
        title: "Error resetting homepage content",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateHeroContent = (field: keyof HomepageHeroContent, value: string) => {
    if (!content) return;
    
    setContent({
      ...content,
      hero: {
        ...content.hero,
        [field]: value
      }
    });
  };

  const updateFeature = (index: number, field: keyof HomepageFeature, value: string) => {
    if (!content) return;
    
    const newFeatures = [...content.features];
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value
    };
    
    setContent({
      ...content,
      features: newFeatures
    });
  };

  const addFeature = () => {
    if (!content) return;
    
    const newFeature: HomepageFeature = {
      icon: 'star',
      title: 'New Feature',
      description: 'Feature description',
      color: 'blue'
    };
    
    setContent({
      ...content,
      features: [...content.features, newFeature]
    });
  };

  const removeFeature = (index: number) => {
    if (!content) return;
    
    const newFeatures = content.features.filter((_, i) => i !== index);
    setContent({
      ...content,
      features: newFeatures
    });
  };

  const updateTestimonial = (index: number, field: keyof HomepageTestimonial, value: string | number) => {
    if (!content) return;
    
    const newTestimonials = [...content.testimonials];
    newTestimonials[index] = {
      ...newTestimonials[index],
      [field]: value
    };
    
    setContent({
      ...content,
      testimonials: newTestimonials
    });
  };

  const addTestimonial = () => {
    if (!content) return;
    
    const newTestimonial: HomepageTestimonial = {
      name: 'Customer Name',
      title: 'Customer Title',
      rating: 5,
      quote: 'Great experience with TAST3D!'
    };
    
    setContent({
      ...content,
      testimonials: [...content.testimonials, newTestimonial]
    });
  };

  const removeTestimonial = (index: number) => {
    if (!content) return;
    
    const newTestimonials = content.testimonials.filter((_, i) => i !== index);
    setContent({
      ...content,
      testimonials: newTestimonials
    });
  };

  const updateDemoItem = (index: number, field: keyof HomepageDemoItem, value: string) => {
    if (!content) return;
    
    const newDemoItems = [...content.demo_items];
    newDemoItems[index] = {
      ...newDemoItems[index],
      [field]: value
    };
    
    setContent({
      ...content,
      demo_items: newDemoItems
    });
  };

  const addDemoItem = () => {
    if (!content) return;
    
    const newDemoItem: HomepageDemoItem = {
      name: 'New Menu',
      description: 'Menu description',
      emoji: '🍽️',
      menu_link: '/menu'
    };
    
    setContent({
      ...content,
      demo_items: [...content.demo_items, newDemoItem]
    });
  };

  const removeDemoItem = (index: number) => {
    if (!content) return;
    
    const newDemoItems = content.demo_items.filter((_, i) => i !== index);
    setContent({
      ...content,
      demo_items: newDemoItems
    });
  };

  const uploadHeroImage = async (file: File) => {
    try {
      // Check file size on frontend (200MB limit)
      const MAX_SIZE = 200 * 1024 * 1024; // 200MB
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (file.size > MAX_SIZE) {
        toast({
          title: "File too large",
          description: `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size of 200MB`,
          variant: "destructive"
        });
        return;
      }

      setUploading('hero');
      setUploadProgress({ ...uploadProgress, hero: 0 });
      
      const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
      const formData = new FormData();
      formData.append('file', file);

      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(prev => ({ ...prev, hero: percentComplete }));
        }
      });

      // Handle completion
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (parseError) {
              reject(new Error('Invalid server response'));
            }
          } else {
            // Try to parse error response
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.detail || `Upload failed: ${xhr.statusText}`));
            } catch (parseError) {
              reject(new Error(`Upload failed: ${xhr.statusText} (${xhr.status})`));
            }
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error during upload'));
      });

      // Send request
      xhr.open('POST', `${backendUrl}/api/homepage/upload/hero`);
      xhr.send(formData);

      const result = await uploadPromise;

      if (content && result) {
        setContent({
          ...content,
          hero: {
            ...content.hero,
            hero_image_base64: result.image_url
          }
        });
        
        setUploadProgress(prev => ({ ...prev, hero: 100 }));
        
        // Reset progress after delay
        setTimeout(() => {
          setUploadProgress(prev => ({ ...prev, hero: 0 }));
        }, 2000);
      }

      toast({
        title: "Hero model uploaded",
        description: `The hero 3D model has been uploaded successfully! ${result.file_size || ''}`,
      });
    } catch (error) {
      toast({
        title: "Error uploading hero model",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      setUploadProgress(prev => ({ ...prev, hero: 0 }));
    } finally {
      setUploading(null);
    }
  };

  const uploadDemoImage = async (file: File, index: number) => {
    try {
      setUploading(`demo-${index}`);
      setUploadProgress(prev => ({ ...prev, [`demo-${index}`]: 0 }));
      
      const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
      const formData = new FormData();
      formData.append('file', file);

      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(prev => ({ ...prev, [`demo-${index}`]: percentComplete }));
        }
      });

      // Handle completion
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (parseError) {
              reject(new Error('Invalid server response'));
            }
          } else {
            // Try to parse error response
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.detail || `Upload failed: ${xhr.statusText}`));
            } catch (parseError) {
              reject(new Error(`Upload failed: ${xhr.statusText} (${xhr.status})`));
            }
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error during upload'));
      });

      // Send request
      xhr.open('POST', `${backendUrl}/api/homepage/upload/demo/${index}`);
      xhr.send(formData);

      const result = await uploadPromise;

      if (content && result) {
        const newDemoItems = [...content.demo_items];
        newDemoItems[index] = {
          ...newDemoItems[index],
          image_base64: result.image_url
        };
        
        setContent({
          ...content,
          demo_items: newDemoItems
        });
        
        setUploadProgress(prev => ({ ...prev, [`demo-${index}`]: 100 }));
        
        // Reset progress after delay
        setTimeout(() => {
          setUploadProgress(prev => ({ ...prev, [`demo-${index}`]: 0 }));
        }, 2000);
      }

      toast({
        title: "Menu image uploaded",
        description: `The menu image for ${content?.demo_items[index]?.name} has been uploaded successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error uploading menu image",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      setUploadProgress(prev => ({ ...prev, [`demo-${index}`]: 0 }));
    } finally {
      setUploading(null);
    }
  };

  const removeHeroImage = () => {
    if (!content) return;
    
    setContent({
      ...content,
      hero: {
        ...content.hero,
        hero_image_base64: undefined
      }
    });
  };

  const removeDemoImage = (index: number) => {
    if (!content) return;
    
    const newDemoItems = [...content.demo_items];
    newDemoItems[index] = {
      ...newDemoItems[index],
      image_base64: undefined
    };
    
    setContent({
      ...content,
      demo_items: newDemoItems
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading homepage content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load homepage content.</p>
        <Button onClick={loadHomepageContent} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Homepage Editor</h2>
          <p className="text-gray-600">Customize your TAST3D homepage content</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => window.open('/', '_blank')}
            className="flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={saving}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={saveHomepageContent}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Hero Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={content.hero.headline}
                onChange={(e) => updateHeroContent('headline', e.target.value)}
                placeholder="Main headline"
              />
            </div>
            <div>
              <Label htmlFor="subheadline">Subheadline</Label>
              <Input
                id="subheadline"
                value={content.hero.subheadline}
                onChange={(e) => updateHeroContent('subheadline', e.target.value)}
                placeholder="Subheadline text"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_cta_text">Primary CTA Text</Label>
              <Input
                id="primary_cta_text"
                value={content.hero.primary_cta_text}
                onChange={(e) => updateHeroContent('primary_cta_text', e.target.value)}
                placeholder="Primary button text"
              />
            </div>
            <div>
              <Label htmlFor="primary_cta_url">Primary CTA URL</Label>
              <Input
                id="primary_cta_url"
                value={content.hero.primary_cta_url}
                onChange={(e) => updateHeroContent('primary_cta_url', e.target.value)}
                placeholder="/menu"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="secondary_cta_text">Secondary CTA Text</Label>
              <Input
                id="secondary_cta_text"
                value={content.hero.secondary_cta_text}
                onChange={(e) => updateHeroContent('secondary_cta_text', e.target.value)}
                placeholder="Secondary button text"
              />
            </div>
            <div>
              <Label htmlFor="secondary_cta_url">Secondary CTA URL</Label>
              <Input
                id="secondary_cta_url"
                value={content.hero.secondary_cta_url}
                onChange={(e) => updateHeroContent('secondary_cta_url', e.target.value)}
                placeholder="#contact"
              />
            </div>
          </div>

          {/* Hero 3D Splat Viewer */}
          <div>
            <Label>Hero 3D Model</Label>
            <div className="mt-2">
              {content.hero.hero_image_base64 ? (
                <div className="relative">
                  {/* Check if it's a splat file or regular image */}
                  {content.hero.hero_image_base64.includes('splat') ? (
                    <SplatViewer 
                      splatUrl={content.hero.hero_image_base64}
                      width={400}
                      height={200}
                      autoRotate={true}
                    />
                  ) : (
                    <div className="relative">
                      <SplatViewer 
                        width={400}
                        height={200}
                        autoRotate={true}
                      />
                      <div className="absolute top-2 left-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                        Regular image uploaded - Upload .splat for 3D
                      </div>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={removeHeroImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <SplatViewer 
                  width={400}
                  height={200}
                  autoRotate={true}
                />
              )}
              <div className="mt-2 space-y-2">
                <input
                  type="file"
                  accept=".ply,.splat,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadHeroImage(file);
                  }}
                  className="hidden"
                  id="hero-image-upload"
                  disabled={uploading === 'hero'}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById('hero-image-upload')?.click()}
                    disabled={uploading === 'hero'}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading === 'hero' ? 'Uploading...' : 'Upload 3D Model'}
                  </Button>
                </div>
                
                {/* Progress Bar */}
                {uploading === 'hero' && uploadProgress.hero !== undefined && (
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress.hero}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {Math.round(uploadProgress.hero)}% uploaded
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Upload .ply or .splat files for 3D models. Regular images will show a placeholder 3D scene.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Features
            </div>
            <Button size="sm" onClick={addFeature}>
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.features.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">Feature {index + 1}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFeature(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Icon</Label>
                    <Input
                      value={feature.icon}
                      onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                      placeholder="icon-name"
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Input
                      value={feature.color}
                      onChange={(e) => updateFeature(index, 'color', e.target.value)}
                      placeholder="blue"
                    />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={feature.title}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      placeholder="Feature title"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={feature.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      placeholder="Feature description"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Testimonials
            </div>
            <Button size="sm" onClick={addTestimonial}>
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.testimonials.map((testimonial, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">Testimonial {index + 1}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeTestimonial(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={testimonial.name}
                      onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={testimonial.title}
                      onChange={(e) => updateTestimonial(index, 'title', e.target.value)}
                      placeholder="Customer title"
                    />
                  </div>
                  <div>
                    <Label>Rating</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={testimonial.rating}
                      onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Avatar URL</Label>
                    <Input
                      value={testimonial.avatar_url || ''}
                      onChange={(e) => updateTestimonial(index, 'avatar_url', e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label>Quote</Label>
                  <Textarea
                    value={testimonial.quote}
                    onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
                    placeholder="Customer testimonial"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Items Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Edit2 className="w-5 h-5 mr-2" />
              Menu Demo Items
            </div>
            <Button size="sm" onClick={addDemoItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.demo_items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">Menu Item {index + 1}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeDemoItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Menu Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateDemoItem(index, 'name', e.target.value)}
                      placeholder="e.g. Breakfast Menu"
                    />
                  </div>
                  <div>
                    <Label>Menu Link</Label>
                    <div className="flex">
                      <Input
                        value={item.menu_link}
                        onChange={(e) => updateDemoItem(index, 'menu_link', e.target.value)}
                        placeholder="/menu"
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(item.menu_link, '_blank')}
                        className="ml-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateDemoItem(index, 'description', e.target.value)}
                      placeholder="Brief description of the menu"
                    />
                  </div>
                </div>

                {/* Menu Image Upload */}
                <div className="mt-4">
                  <Label>Menu Image</Label>
                  <div className="mt-2">
                    {item.image_base64 ? (
                      <div className="relative inline-block">
                        <img 
                          src={item.image_base64} 
                          alt={item.name} 
                          className="w-48 h-32 object-cover rounded-lg border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeDemoImage(index)}
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">No menu image</p>
                        </div>
                      </div>
                    )}
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadDemoImage(file, index);
                        }}
                        className="hidden"
                        id={`demo-image-upload-${index}`}
                        disabled={uploading === `demo-${index}`}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => document.getElementById(`demo-image-upload-${index}`)?.click()}
                        disabled={uploading === `demo-${index}`}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading === `demo-${index}` ? 'Uploading...' : 'Upload Menu Image'}
                      </Button>
                      
                      {/* Progress Bar */}
                      {uploading === `demo-${index}` && uploadProgress[`demo-${index}`] !== undefined && (
                        <div className="space-y-1 mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress[`demo-${index}`]}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600">
                            {Math.round(uploadProgress[`demo-${index}`])}% uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomepageEditor;