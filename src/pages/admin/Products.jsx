import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaImage,
  FaTimes,
  FaSearch,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Products = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: 'T-shirt',
    description: '',
    price: '',
    discountedPrice: '',
    tieredPricing: [],
    stock: '',
    image: '',
    images: [],
    isActive: true,
    isPreorder: false,
    preorderPaymentType: 'half',
    requireCustomNameNumber: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]); // Multiple images
  const [uploading, setUploading] = useState(false);

  const categories = ['T-shirt', 'Hoodie', 'Jersey'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.products || response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Tiered Pricing Functions
  const addTierPrice = () => {
    setFormData((prev) => ({
      ...prev,
      tieredPricing: [...prev.tieredPricing, { quantity: prev.tieredPricing.length + 1, price: '' }]
    }));
  };

  const removeTierPrice = (index) => {
    setFormData((prev) => ({
      ...prev,
      tieredPricing: prev.tieredPricing.filter((_, i) => i !== index)
    }));
  };

  const updateTierPrice = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.tieredPricing];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, tieredPricing: updated };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      setImageFile(file);
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file sizes
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} image(s) exceed 10MB limit`);
      return;
    }

    // Limit to 10 images total
    const currentImageCount = (formData.images || []).length;
    const maxNewImages = Math.max(0, 10 - currentImageCount);
    const filesToAdd = files.slice(0, maxNewImages);
    
    if (files.length > maxNewImages) {
      toast.warning(`Only ${maxNewImages} more image(s) can be added (max 10 total)`);
    }

    if (filesToAdd.length === 0) return;

    setImageFiles((prev) => [...prev, ...filesToAdd]);

    // Create previews
    let loadedCount = 0;
    const previews = [];
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        loadedCount++;
        if (loadedCount === filesToAdd.length) {
          setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...previews],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file = null) => {
    const fileToUpload = file || imageFile;
    // If we have an imageFile, upload it
    if (fileToUpload) {
      try {
        const token = await currentUser.getIdToken();
        const uploadFormData = new FormData();
        uploadFormData.append('image', fileToUpload);
        uploadFormData.append('folder', 'products');

        const response = await axios.post(`${API_URL}/upload/image`, uploadFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!response.data || !response.data.url) {
          throw new Error('No URL returned from upload');
        }

        return response.data.url;
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to upload image';
        toast.error(errorMessage);
        throw error;
      }
    }

    // If we have a base64 data URL, convert and upload
    if (formData.image && formData.image.startsWith('data:')) {
      try {
        // Convert data URL to blob
        const response = await fetch(formData.image);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });
        
        const token = await currentUser.getIdToken();
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        uploadFormData.append('folder', 'products');

        const uploadResponse = await axios.post(`${API_URL}/upload/image`, uploadFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!uploadResponse.data || !uploadResponse.data.url) {
          throw new Error('No URL returned from upload');
        }

        return uploadResponse.data.url;
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to upload image';
        toast.error(errorMessage);
        throw error;
      }
    }

    // No image to upload
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if image is required (new product needs image)
    if (!editingProduct && !imageFile && !formData.image) {
      toast.error('Please upload an image');
      return;
    }

    try {
      setUploading(true);
      
      let imageUrl = formData.image;
      
      // Upload multiple images
      let uploadedImages = [];
      if (imageFiles.length > 0) {
        try {
          for (const file of imageFiles) {
            const url = await uploadImage(file);
            if (url) {
              uploadedImages.push(url);
            }
          }
        } catch (uploadError) {
          setUploading(false);
          return;
        }
      }

      // Only upload if we have a new image file
      // If editing and no new image, use existing image URL
      if (imageFile) {
        // We have a new image file to upload
        try {
          imageUrl = await uploadImage();
          if (!imageUrl) {
            toast.error('Failed to upload image');
            setUploading(false);
            return;
          }
        } catch (uploadError) {
          // If upload fails, don't proceed with saving
          setUploading(false);
          return;
        }
      } else if (!editingProduct && formData.image && formData.image.startsWith('data:')) {
        // New product with base64 image - need to upload
        try {
          imageUrl = await uploadImage();
          if (!imageUrl) {
            toast.error('Failed to upload image');
            setUploading(false);
            return;
          }
        } catch (uploadError) {
          setUploading(false);
          return;
        }
      } else if (editingProduct && formData.image && formData.image.startsWith('http')) {
        // Editing: use existing image URL (no upload needed)
        imageUrl = formData.image;
      }

      if (!imageUrl) {
        toast.error('Please upload an image');
        setUploading(false);
        return;
      }

      // Ensure we never send base64 data - only URLs
      if (imageUrl.startsWith('data:')) {
        toast.error('Image upload failed. Please try uploading the image again.');
        setUploading(false);
        return;
      }

      // Validate it's a proper URL
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        toast.error('Invalid image URL. Please upload the image again.');
        setUploading(false);
        return;
      }

      const token = await currentUser.getIdToken();

      // Normalize category for backend
      const normalizeCategory = (cat) => {
        const lower = (cat || '').toLowerCase().trim();
        if (lower === 't-shirt' || lower === 't shirt' || lower === 'tshirt') return 'tshirt';
        if (lower === 'hoodie' || lower === 'hoodies') return 'hoodie';
        if (lower === 'jersey' || lower === 'jerseys') return 'jersey';
        return lower;
      };

      // Combine existing images with newly uploaded ones
      // When editing: keep existing URLs and add new uploaded ones
      // When creating: only use newly uploaded ones
      const existingImageUrls = editingProduct 
        ? (formData.images || []).filter(img => typeof img === 'string' && img.startsWith('http'))
        : [];
      const allImages = [...existingImageUrls, ...uploadedImages];

      const productData = {
        name: formData.name,
        category: normalizeCategory(formData.category),
        description: formData.description || '',
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
        tieredPricing: formData.tieredPricing.filter(t => t.price && t.quantity).map(t => ({
          quantity: parseInt(t.quantity),
          price: parseFloat(t.price)
        })),
        stock: parseInt(formData.stock),
        image: imageUrl,
        images: allImages.length > 0 ? allImages : undefined,
        // Only respected by backend on update; POST ignores and defaults to true
        isActive: formData.isActive,
        isPreorder: formData.isPreorder,
        preorderPaymentType: formData.preorderPaymentType,
        requireCustomNameNumber: formData.requireCustomNameNumber,
      };

      if (editingProduct) {
        // Update existing product
        await axios.put(
          `${API_URL}/products/${editingProduct._id}`,
          productData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Product updated successfully!');
      } else {
        // Add new product
        await axios.post(`${API_URL}/products`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Product added successfully!');
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save product';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || '',
      price: product.price.toString(),
      discountedPrice: product.discountedPrice ? product.discountedPrice.toString() : '',
      tieredPricing: product.tieredPricing && Array.isArray(product.tieredPricing) 
        ? product.tieredPricing.map(t => ({ quantity: t.quantity, price: t.price.toString() }))
        : [],
      stock: product.stock.toString(),
      image: product.image,
      images: product.images || [],
      isActive: product.isActive !== false,
      isPreorder: !!product.isPreorder,
      preorderPaymentType: product.preorderPaymentType || 'half',
      requireCustomNameNumber: !!product.requireCustomNameNumber,
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'T-shirt',
      description: '',
      price: '',
      discountedPrice: '',
      tieredPricing: [],
      stock: '',
      image: '',
      images: [],
      isPreorder: false,
      preorderPaymentType: 'half',
      requireCustomNameNumber: false,
    });
    setImageFile(null);
    setImageFiles([]);
    setEditingProduct(null);
    setShowModal(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleToggleActive = async (product) => {
    try {
      const token = await currentUser.getIdToken();
      const next = !product.isActive;
      await axios.put(
        `${API_URL}/products/${product._id}`,
        { isActive: next },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(next ? 'Product is now visible in UI' : 'Product hidden from UI');
      setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, isActive: next } : p)));
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-2">Manage your clothing inventory</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn bg-black text-white hover:bg-gray-800 border-none gap-2"
          >
            <FaPlus />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Show in UI</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td>
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-lg">
                          <img
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="font-semibold">{product.name}
                      {product.isPreorder && (
                        <span className="ml-2 badge badge-warning">Pre Order</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-outline">{product.category}</span>
                    </td>
                    <td>
                      {product.discountedPrice ? (
                        <div>
                          <p className="text-xs text-gray-500 line-through">{Number(product.price).toFixed(0)} Taka</p>
                          <p className="font-semibold text-green-600">{Number(product.discountedPrice).toFixed(0)} Taka</p>
                        </div>
                      ) : (
                        <p className="font-semibold">{Number(product.price).toFixed(0)} Taka</p>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          product.stock > 10
                            ? 'badge-success'
                            : product.stock > 0
                            ? 'badge-warning'
                            : 'badge-error'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${product.isActive !== false ? 'badge-success' : 'badge-ghost'}`}>
                          {product.isActive !== false ? 'Shown' : 'Hidden'}
                        </span>
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`btn btn-xs ${product.isActive !== false ? 'btn-outline' : 'btn-info text-white'}`}
                          title={product.isActive !== false ? 'Hide from UI' : 'Show in UI'}
                        >
                          {product.isActive !== false ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No products found
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={resetForm}
                  className="btn btn-ghost btn-circle"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Product Image *
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <label className="btn btn-outline gap-2 cursor-pointer">
                      <FaImage />
                      Choose Main Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Additional Images Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Images (Optional)
                  </label>
                  <label className="btn btn-outline gap-2 cursor-pointer mb-4">
                    <FaImage />
                    Choose Multiple Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleImagesChange}
                      className="hidden"
                    />
                  </label>
                  
                  {/* Preview additional images */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="E.g., Classic Black T-Shirt"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show in UI (only relevant when editing; defaults to true on create) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Show in UI
                  </label>
                  <div className="form-control w-fit">
                    <label className="cursor-pointer label gap-3">
                      <span className="label-text">{formData.isActive ? 'Shown' : 'Hidden'}</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={formData.isActive}
                        onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                      />
                    </label>
                  </div>
                </div>

                {/* Preorder & Customization Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pre Order Product</label>
                    <div className="form-control w-fit">
                      <label className="cursor-pointer label gap-3">
                        <span className="label-text">{formData.isPreorder ? 'Pre Order' : 'Regular'}</span>
                        <input
                          type="checkbox"
                          className="toggle toggle-warning"
                          checked={formData.isPreorder}
                          onChange={(e) => setFormData((prev) => ({ ...prev, isPreorder: e.target.checked }))}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ask Custom Name & Number</label>
                    <div className="form-control w-fit">
                      <label className="cursor-pointer label gap-3">
                        <span className="label-text">{formData.requireCustomNameNumber ? 'Enabled' : 'Disabled'}</span>
                        <input
                          type="checkbox"
                          className="toggle toggle-info"
                          checked={formData.requireCustomNameNumber}
                          onChange={(e) => setFormData((prev) => ({ ...prev, requireCustomNameNumber: e.target.checked }))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preorder Payment Type - Only show if isPreorder is true */}
                {formData.isPreorder && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preorder Payment Type</label>
                    <div className="flex gap-4">
                      <label className="cursor-pointer label gap-2">
                        <input
                          type="radio"
                          name="preorderPaymentType"
                          value="half"
                          checked={formData.preorderPaymentType === 'half'}
                          onChange={(e) => setFormData((prev) => ({ ...prev, preorderPaymentType: e.target.value }))}
                          className="radio radio-warning"
                        />
                        <span className="label-text">Pay 50% Now (Half Payment)</span>
                      </label>
                      <label className="cursor-pointer label gap-2">
                        <input
                          type="radio"
                          name="preorderPaymentType"
                          value="full"
                          checked={formData.preorderPaymentType === 'full'}
                          onChange={(e) => setFormData((prev) => ({ ...prev, preorderPaymentType: e.target.value }))}
                          className="radio radio-success"
                        />
                        <span className="label-text">Pay Full Amount Now</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered w-full"
                    placeholder="Product description..."
                    rows="3"
                  />
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Regular Price (Taka) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discounted Price (Taka)
                      <span className="text-xs text-gray-500 ml-1">(Optional - Single Discount)</span>
                    </label>
                    <input
                      type="number"
                      name="discountedPrice"
                      value={formData.discountedPrice}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="400"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">For quantity-based pricing, use Tiered Pricing below</p>
                  </div>
                </div>

                {/* Tiered Pricing Section */}
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity-Based Tiered Pricing
                      <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={addTierPrice}
                      className="btn btn-sm bg-green-600 text-white hover:bg-green-700 border-none"
                    >
                      + Add Price Tier
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Set different prices based on total quantity of this product in cart. Example: Buy 2+ for 450 Taka each, Buy 5+ for 400 Taka each.
                  </p>
                  
                  {formData.tieredPricing.length > 0 ? (
                    <div className="space-y-2">
                      {formData.tieredPricing.map((tier, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border">
                          <span className="text-sm font-medium whitespace-nowrap">
                            Each price if buy {tier.quantity}:
                          </span>
                          <input
                            type="number"
                            value={tier.price}
                            onChange={(e) => updateTierPrice(index, 'price', e.target.value)}
                            className="input input-bordered input-sm flex-1"
                            placeholder={`Price for quantity ${tier.quantity}`}
                            min="0"
                          />
                          <span className="text-sm">Taka</span>
                          <button
                            type="button"
                            onClick={() => removeTierPrice(index)}
                            className="btn btn-sm btn-error"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No tiered pricing set. Click &quot;Add Price Tier&quot; to add quantity-based discounts.</p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="100"
                    min="0"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`btn bg-black text-white hover:bg-gray-800 border-none flex-1 ${
                      uploading ? 'loading' : ''
                    }`}
                  >
                    {uploading
                      ? 'Saving...'
                      : editingProduct
                      ? 'Update Product'
                      : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default Products;
