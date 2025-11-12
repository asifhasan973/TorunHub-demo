import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaSave, FaImage, FaTrash } from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Settings = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Chassi',
    tagline: 'Wear Your Style',
    heroTitle: 'Welcome to Chassi',
    heroSubtitle: 'Premium Quality Clothing',
    carouselImages: [],
    bannerImage: '',
    contactEmail: 'contact@chassi.com',
    contactPhone: '+1234567890',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
    },
  });
  const [newCarouselImage, setNewCarouselImage] = useState(null);
  const [newBannerImage, setNewBannerImage] = useState(null);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/settings`);
      if (response.data) {
        setSettings({ ...settings, ...response.data });
      }
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCarouselImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setNewCarouselImage(file);
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setNewBannerImage(file);
  };

  const uploadImage = async (file, folder) => {
    try {
      const token = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const response = await axios.post(`${API_URL}/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error) {
      toast.error('Failed to upload image');
      return null;
    }
  };

  const addCarouselImage = async () => {
    if (!newCarouselImage) {
      toast.error('Please select an image');
      return;
    }

    try {
      setSaving(true);
      const imageUrl = await uploadImage(newCarouselImage, 'carousel');
      if (imageUrl) {
        const updatedImages = [...(settings.carouselImages || []), imageUrl];
        setSettings((prev) => ({ ...prev, carouselImages: updatedImages }));
        setNewCarouselImage(null);
        toast.success('Carousel image added!');
      }
    } catch (error) {
      toast.error('Failed to add carousel image');
    } finally {
      setSaving(false);
    }
  };

  const removeCarouselImage = (index) => {
    const updatedImages = settings.carouselImages.filter((_, i) => i !== index);
    setSettings((prev) => ({ ...prev, carouselImages: updatedImages }));
  };

  const updateBannerImage = async () => {
    if (!newBannerImage) return;

    try {
      setSaving(true);
      const imageUrl = await uploadImage(newBannerImage, 'banner');
      if (imageUrl) {
        setSettings((prev) => ({ ...prev, bannerImage: imageUrl }));
        setNewBannerImage(null);
        toast.success('Banner image updated!');
      }
    } catch (error) {
      toast.error('Failed to update banner image');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Upload pending images
      if (newCarouselImage) {
        await addCarouselImage();
      }
      if (newBannerImage) {
        await updateBannerImage();
      }

      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/settings`,
        settings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast.success('Settings saved successfully!');
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
            <p className="text-gray-600 mt-2">Configure your website appearance and content</p>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className={`btn bg-black text-white hover:bg-gray-800 border-none gap-2 ${
              saving ? 'loading' : ''
            }`}
          >
            {!saving && <FaSave />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4">General Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={settings.tagline}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Title
                </label>
                <input
                  type="text"
                  name="heroTitle"
                  value={settings.heroTitle}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  name="heroSubtitle"
                  value={settings.heroSubtitle}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Banner Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4">Banner Image</h2>
            <div className="space-y-4">
              {settings.bannerImage && (
                <img
                  src={settings.bannerImage}
                  alt="Banner"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div className="flex gap-4">
                <label className="btn btn-outline gap-2 cursor-pointer">
                  <FaImage />
                  Choose Banner Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageUpload}
                    className="hidden"
                  />
                </label>
                {newBannerImage && (
                  <button
                    onClick={updateBannerImage}
                    className="btn bg-black text-white hover:bg-gray-800 border-none"
                    disabled={saving}
                  >
                    Upload Banner
                  </button>
                )}
              </div>
              {newBannerImage && (
                <p className="text-sm text-gray-600">
                  Selected: {newBannerImage.name}
                </p>
              )}
            </div>
          </motion.div>

          {/* Carousel Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4">Carousel Images</h2>
            
            {/* Current Images */}
            {settings.carouselImages && settings.carouselImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {settings.carouselImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Carousel ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeCarouselImage(index)}
                      className="absolute top-2 right-2 btn btn-sm btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Image */}
            <div className="flex gap-4">
              <label className="btn btn-outline gap-2 cursor-pointer">
                <FaImage />
                Choose Carousel Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCarouselImageUpload}
                  className="hidden"
                />
              </label>
              {newCarouselImage && (
                <button
                  onClick={addCarouselImage}
                  className="btn bg-black text-white hover:bg-gray-800 border-none"
                  disabled={saving}
                >
                  Add to Carousel
                </button>
              )}
            </div>
            {newCarouselImage && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {newCarouselImage.name}
              </p>
            )}
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={settings.contactPhone}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4">Social Media Links</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  name="socialMedia.facebook"
                  value={settings.socialMedia?.facebook || ''}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="https://facebook.com/torunhut"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  name="socialMedia.instagram"
                  value={settings.socialMedia?.instagram || ''}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="https://instagram.com/torunhut"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  name="socialMedia.twitter"
                  value={settings.socialMedia?.twitter || ''}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="https://twitter.com/torunhut"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default Settings;
