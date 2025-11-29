import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../services/auth';
import { imageUploadService } from '../services/imageUpload';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Calendar, Clock } from 'lucide-react';

export const AddProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: '',
    discountPrice: '',
    currency: 'INR',
    cuisine: '',
    categories: [],
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isEggless: false,
      isJain: false,
      isBestSeller: false
    },
    availability: {
      isAvailable: true,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      availableFrom: '00:00',
      availableUntil: '23:59'
    }
  });

  const cuisines = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican', 'Continental', 'Desserts', 'Beverages', 'Arabian'];
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Main Course', 'Rice Items', 'Desserts', 'Beverages', 'Bread Items', 'Thali'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Supported image types
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    if (productId) {
      setIsEditing(true);
      fetchProductData();
    }
  }, [productId]);

  // Set image preview when imageUrl changes
  useEffect(() => {
    if (formData.imageUrl) {
      setImagePreview(formData.imageUrl);
    }
  }, [formData.imageUrl]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(productId);
      const product = response.data.product;
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        price: product.price?.toString() || '',
        discountPrice: product.discountPrice?.toString() || '',
        currency: product.currency || 'INR',
        cuisine: product.cuisine || '',
        categories: product.categories || [],
        dietaryInfo: {
          isVegetarian: product.dietaryInfo?.isVegetarian || false,
          isVegan: product.dietaryInfo?.isVegan || false,
          isGlutenFree: product.dietaryInfo?.isGlutenFree || false,
          isEggless: product.dietaryInfo?.isEggless || false,
          isJain: product.dietaryInfo?.isJain || false,
          isBestSeller: product.dietaryInfo?.isBestSeller || false
        },
        availability: {
          isAvailable: product.availability?.isAvailable ?? true,
          availableDays: product.availability?.availableDays || daysOfWeek,
          availableFrom: product.availability?.availableFrom || '00:00',
          availableUntil: product.availability?.availableUntil || '23:59'
        }
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      addToast('Failed to load product data', 'error');
      navigate('/menu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!supportedFormats.includes(file.type)) {
        addToast('Please select a valid image file (JPEG, PNG, WebP)', 'error');
        return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
        addToast('Image size should be less than 5MB', 'error');
        return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Upload file
    setUploading(true);
    try {
        const imageUrl = await imageUploadService.uploadImage(file);
        setFormData(prev => ({ ...prev, imageUrl }));
        addToast('Image uploaded successfully!', 'success');
    } catch (error) {
        console.error('Upload error:', error);
        addToast(error.message || 'Failed to upload image', 'error');
        setImagePreview('');
        // Don't clear formData.imageUrl if we're editing and had a previous image
        if (!isEditing || !formData.imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        }
    } finally {
        setUploading(false);
        // Clear file input
        if (fileInputRef.current) {
        fileInputRef.current.value = '';
        }
    }
};

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        availableDays: prev.availability.availableDays.includes(day)
          ? prev.availability.availableDays.filter(d => d !== day)
          : [...prev.availability.availableDays, day]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate required fields
      const requiredFields = ['name', 'description', 'price', 'cuisine', 'imageUrl'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        addToast(`Missing required fields: ${missingFields.join(', ')}`, 'error');
        setLoading(false);
        return;
      }

      if (formData.categories.length === 0) {
        addToast('Please select at least one category', 'error');
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl,
        price: parseFloat(formData.price),
        currency: formData.currency,
        cuisine: formData.cuisine,
        categories: formData.categories,
        dietaryInfo: formData.dietaryInfo,
        availability: formData.availability
      };

      // Add discountPrice only if provided
      if (formData.discountPrice && formData.discountPrice !== '') {
        submitData.discountPrice = parseFloat(formData.discountPrice);
      }

      if (isEditing) {
        await productAPI.update(productId, submitData);
        addToast('Product updated successfully!', 'success');
      } else {
        await productAPI.create(submitData);
        addToast('Product added successfully!', 'success');
      }
      
      navigate('/menu');
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} product:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} product`;
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Replace the image URL section with this updated code
  const renderImageUploadSection = () => (
    <div className="space-y-4">
      <Label className="flex items-center gap-1">
        Product Image <span className="text-red-500">*</span>
      </Label>
      
      {/* Image Preview */}
      {imagePreview && (
        <div className="relative inline-block">
          <div className="w-48 h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
            <img
              src={`${API_BASE_URL}${imagePreview}`}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <div className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-colors ${
        uploading ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : 'hover:border-gray-400 dark:hover:border-gray-500'
      }`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {uploading ? 'Uploading...' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Supports: JPEG, PNG, WebP (Max 5MB)
          </p>
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileInput}
          disabled={uploading}
          className="mt-4"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Select Image'}
        </Button>
      </div>

      {/* Current Image URL (hidden but still in form data) */}
      <input
        type="hidden"
        value={formData.imageUrl}
        required
      />
    </div>
  );

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-start mb-4">
              <Button variant="outline" onClick={() => navigate('/menu')} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Menu
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Loading Product...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-start mb-4">
            <Button variant="outline" onClick={() => navigate('/menu')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEditing ? 'Update the product details below' : 'Fill in the details to add a new product to the menu'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="dietary">Dietary & Categories</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Essential details about the product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-1">
                        Product Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Butter Chicken"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cuisine" className="flex items-center gap-1">
                        Cuisine <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.cuisine} onValueChange={(value) => handleInputChange('cuisine', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                          {cuisines.map((cuisine) => (
                            <SelectItem key={cuisine} value={cuisine}>
                              {cuisine}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-1">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the product in detail..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  {/* Updated Image Upload Section */}
                  {renderImageUploadSection()}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="flex items-center gap-1">
                        Price (INR) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountPrice">Discount Price (INR)</Label>
                      <Input
                        id="discountPrice"
                        type="number"
                        placeholder="0.00"
                        value={formData.discountPrice}
                        onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dietary">
              <Card>
                <CardHeader>
                  <CardTitle>Dietary Information & Categories</CardTitle>
                  <CardDescription>Set dietary preferences and product categories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-4 block">Dietary Information</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.keys(formData.dietaryInfo).map((key) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={formData.dietaryInfo[key]}
                            onCheckedChange={(checked) => 
                              handleNestedChange('dietaryInfo', key, checked)
                            }
                          />
                          <Label htmlFor={key} className="capitalize">
                            {key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-4 block">Categories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={formData.categories.includes(category)}
                            onCheckedChange={() => handleCategoryToggle(category)}
                          />
                          <Label htmlFor={`category-${category}`}>{category}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Settings</CardTitle>
                  <CardDescription>Set when and on which days the product is available</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAvailable"
                      checked={formData.availability.isAvailable}
                      onCheckedChange={(checked) => 
                        handleNestedChange('availability', 'isAvailable', checked)
                      }
                    />
                    <Label htmlFor="isAvailable" className="text-base">
                      Product is available for ordering
                    </Label>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-4 block">Available Days</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day}`}
                            checked={formData.availability.availableDays.includes(day)}
                            onCheckedChange={() => handleDayToggle(day)}
                          />
                          <Label htmlFor={`day-${day}`}>{day}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="availableFrom" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Available From
                      </Label>
                      <Input
                        id="availableFrom"
                        type="time"
                        value={formData.availability.availableFrom}
                        onChange={(e) => handleNestedChange('availability', 'availableFrom', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availableUntil" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Available Until
                      </Label>
                      <Input
                        id="availableUntil"
                        type="time"
                        value={formData.availability.availableUntil}
                        onChange={(e) => handleNestedChange('availability', 'availableUntil', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/menu')}
              disabled={loading || uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || uploading || !formData.imageUrl} 
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading || uploading 
                ? (isEditing ? 'Updating Product...' : 'Adding Product...')
                : (isEditing ? 'Update Product' : 'Add Product')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};