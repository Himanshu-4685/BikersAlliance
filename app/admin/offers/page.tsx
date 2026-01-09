'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiToggleLeft, 
  FiToggleRight,
  FiCalendar,
  FiMapPin,
  FiPercent
} from 'react-icons/fi';

interface Offer {
  id: string;
  title: string;
  bike_name: string;
  brand: string;
  offer_price: number;
  original_price: number;
  discount_percent: number;
  offer_type: string;
  location: string;
  dealer_name: string;
  valid_till: string;
  is_active: boolean;
  image_url?: string;
  created_at: string;
}

export default function AdminOffersPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadImageToSupabase = async (file: File, offerId?: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (offerId) {
        formData.append('offerId', offerId);
      }
      
      console.log('Uploading file:', file.name, 'for offer:', offerId); // Debug logging
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      console.log('Upload API response:', result); // Debug logging
      
      if (result.success) {
        console.log('Image URL from API:', result.data.imageUrl); // Debug logging
        return result.data.imageUrl;
      } else {
        throw new Error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageUpload = (file: File, isEdit: boolean = false) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (isEdit) {
          setEditImagePreview(result);
          setEditSelectedFile(file);
        } else {
          setImagePreview(result);
          setSelectedFile(file);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/offers?active=false');
      const result = await response.json();
      
      if (result.success) {
        setOffers(result.data || []);
      } else {
        setError(result.message || 'Failed to fetch offers');
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/offers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: offerId,
          is_active: !currentStatus
        })
      });

      const result = await response.json();
      if (result.success) {
        fetchOffers();
      } else {
        alert('Failed to update offer status');
      }
    } catch (err) {
      console.error('Error updating offer:', err);
      alert('Failed to update offer status');
    }
  };

  const createOffer = async (offerData: Partial<Offer>) => {
    try {
      setUploading(true);
      
      // First create the offer without image
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...offerData,
          is_active: offerData.is_active ?? true
        })
      });

      const result = await response.json();
      if (result.success) {
        let imageUrl = null;
        
        // If there's a selected file, upload it
        if (selectedFile) {
          try {
            imageUrl = await uploadImageToSupabase(selectedFile, result.data.offer.id);
            console.log('About to update offer with image URL:', imageUrl); // Debug logging
            console.log('Offer data being sent:', {
              ...result.data.offer,
              image_url: imageUrl
            }); // Debug logging
            
            // Update the offer with the image URL
            const updateResponse = await fetch('/api/offers', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                ...result.data.offer,
                image_url: imageUrl
              })
            });
            
            const updateResult = await updateResponse.json();
            console.log('Update result:', updateResult); // Debug logging
            
            if (!updateResponse.ok) {
              console.error('Failed to update offer with image');
            }
          } catch (imageError) {
            console.error('Error uploading image:', imageError);
            // Don't fail the entire operation if image upload fails
          }
        }
        
        fetchOffers();
        setShowCreateModal(false);
        setNewOffer({});
        setImagePreview(null);
        setSelectedFile(null);
      } else {
        alert('Failed to create offer: ' + result.message);
      }
    } catch (err) {
      console.error('Error creating offer:', err);
      alert('Failed to create offer');
    } finally {
      setUploading(false);
    }
  };

  const updateOffer = async (updatedOffer: Offer) => {
    try {
      setUploading(true);
      let offerToUpdate = {...updatedOffer};
      
      // If there's a new image selected, upload it first
      if (editSelectedFile) {
        try {
          const imageUrl = await uploadImageToSupabase(editSelectedFile, updatedOffer.id);
          offerToUpdate.image_url = imageUrl;
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          alert('Failed to upload image, but will continue with other updates');
        }
      }
      
      const response = await fetch('/api/offers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(offerToUpdate)
      });

      const result = await response.json();
      if (result.success) {
        fetchOffers();
        setShowEditModal(false);
        setEditingOffer(null);
        setEditImagePreview(null);
        setEditSelectedFile(null);
      } else {
        alert('Failed to update offer: ' + result.message);
      }
    } catch (err) {
      console.error('Error updating offer:', err);
      alert('Failed to update offer');
    } finally {
      setUploading(false);
    }
  };

  const deleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      const response = await fetch(`/api/offers?id=${offerId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        fetchOffers();
      } else {
        alert('Failed to delete offer');
      }
    } catch (err) {
      console.error('Error deleting offer:', err);
      alert('Failed to delete offer');
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Bike Offers Management" />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bike Offers Management</h1>
                <p className="text-gray-600 mt-1">Manage promotional offers and deals</p>
              </div>
              <button
                onClick={() => {
                  setNewOffer({
                    title: '',
                    bike_name: '',
                    brand: '',
                    offer_price: 0,
                    original_price: 0,
                    discount_percent: 0,
                    offer_type: 'Limited Time',
                    location: '',
                    dealer_name: '',
                    valid_till: '',
                    is_active: true
                  });
                  setImagePreview(null);
                  setSelectedFile(null);
                  setShowCreateModal(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors flex items-center"
              >
                <FiPlus className="mr-2" />
                Create New Offer
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiEye className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Offers</p>
                  <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiToggleRight className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Offers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {offers.filter(offer => offer.is_active).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FiCalendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {offers.filter(offer => {
                      if (!offer.valid_till) return false;
                      const daysUntilExpiry = Math.ceil((new Date(offer.valid_till).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiPercent className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Discount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {offers.length > 0 
                      ? Math.round(offers.reduce((sum, offer) => sum + (offer.discount_percent || 0), 0) / offers.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Offers Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Offers</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading offers...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={fetchOffers}
                  className="mt-2 bg-primary text-white px-4 py-2 rounded-md"
                >
                  Retry
                </button>
              </div>
            ) : offers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No offers found. Create your first offer!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Offer Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bike & Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pricing
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {offers.map((offer) => {
                      const isExpired = offer.valid_till ? new Date(offer.valid_till) < new Date() : false;
                      const daysUntilExpiry = offer.valid_till ? Math.ceil((new Date(offer.valid_till).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
                      
                      return (
                        <tr key={offer.id} className={isExpired ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                              <div className="text-sm text-gray-500">{offer.offer_type}</div>
                              {offer.valid_till && (
                                <div className="text-xs text-gray-400">
                                  Valid till: {new Date(offer.valid_till).toLocaleDateString()}
                                  {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                                    <span className="ml-2 text-yellow-600">({daysUntilExpiry} days left)</span>
                                  )}
                                  {isExpired && (
                                    <span className="ml-2 text-red-600">(Expired)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{offer.bike_name}</div>
                            <div className="text-sm text-gray-500">{offer.brand}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatPrice(offer.offer_price)}</div>
                            {offer.original_price && (
                              <div className="text-sm text-gray-500 line-through">{formatPrice(offer.original_price)}</div>
                            )}
                            {offer.discount_percent && (
                              <div className="text-sm text-green-600">{offer.discount_percent}% OFF</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <FiMapPin className="mr-1 w-4 h-4" />
                              {offer.location}
                            </div>
                            <div className="text-sm text-gray-500">{offer.dealer_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                offer.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {offer.is_active ? (
                                <><FiToggleRight className="mr-1" /> Active</>
                              ) : (
                                <><FiToggleLeft className="mr-1" /> Inactive</>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingOffer(offer);
                                  setEditImagePreview(null);
                                  setEditSelectedFile(null);
                                  setShowEditModal(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit offer"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteOffer(offer.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete offer"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Create New Offer
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newOffer.title || ''}
                    onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter offer title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bike Name *
                  </label>
                  <input
                    type="text"
                    value={newOffer.bike_name || ''}
                    onChange={(e) => setNewOffer({...newOffer, bike_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter bike name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={newOffer.brand || ''}
                    onChange={(e) => setNewOffer({...newOffer, brand: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter brand name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={newOffer.offer_price || ''}
                    onChange={(e) => setNewOffer({...newOffer, offer_price: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter offer price"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newOffer.original_price || ''}
                    onChange={(e) => setNewOffer({...newOffer, original_price: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter original price"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={newOffer.discount_percent || ''}
                    onChange={(e) => setNewOffer({...newOffer, discount_percent: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter discount percentage"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Type *
                  </label>
                  <select
                    value={newOffer.offer_type || 'Limited Time'}
                    onChange={(e) => setNewOffer({...newOffer, offer_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="Limited Time">Limited Time</option>
                    <option value="Festival">Festival</option>
                    <option value="Premium">Premium</option>
                    <option value="Exchange">Exchange</option>
                    <option value="First Time">First Time</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={newOffer.location || ''}
                    onChange={(e) => setNewOffer({...newOffer, location: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter location"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dealer Name *
                  </label>
                  <input
                    type="text"
                    value={newOffer.dealer_name || ''}
                    onChange={(e) => setNewOffer({...newOffer, dealer_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter dealer name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Till *
                  </label>
                  <input
                    type="date"
                    value={newOffer.valid_till || ''}
                    onChange={(e) => setNewOffer({...newOffer, valid_till: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, false);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="create_is_active"
                  checked={newOffer.is_active ?? true}
                  onChange={(e) => setNewOffer({...newOffer, is_active: e.target.checked})}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="create_is_active" className="ml-2 block text-sm text-gray-900">
                  Active Offer
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewOffer({});
                    setImagePreview(null);
                    setSelectedFile(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Basic validation
                    if (!newOffer.title || !newOffer.bike_name || !newOffer.brand || 
                        !newOffer.offer_price || !newOffer.location || !newOffer.dealer_name || 
                        !newOffer.valid_till) {
                      alert('Please fill in all required fields marked with *');
                      return;
                    }
                    createOffer(newOffer);
                  }}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Creating...' : 'Create Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Offer
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingOffer.title}
                    onChange={(e) => setEditingOffer({...editingOffer, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bike Name
                  </label>
                  <input
                    type="text"
                    value={editingOffer.bike_name}
                    onChange={(e) => setEditingOffer({...editingOffer, bike_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editingOffer.brand}
                    onChange={(e) => setEditingOffer({...editingOffer, brand: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editingOffer.offer_price}
                    onChange={(e) => setEditingOffer({...editingOffer, offer_price: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editingOffer.original_price}
                    onChange={(e) => setEditingOffer({...editingOffer, original_price: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={editingOffer.discount_percent}
                    onChange={(e) => setEditingOffer({...editingOffer, discount_percent: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Type
                  </label>
                  <select
                    value={editingOffer.offer_type}
                    onChange={(e) => setEditingOffer({...editingOffer, offer_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Limited Time">Limited Time</option>
                    <option value="Festival">Festival</option>
                    <option value="Premium">Premium</option>
                    <option value="Exchange">Exchange</option>
                    <option value="First Time">First Time</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingOffer.location}
                    onChange={(e) => setEditingOffer({...editingOffer, location: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dealer Name
                  </label>
                  <input
                    type="text"
                    value={editingOffer.dealer_name}
                    onChange={(e) => setEditingOffer({...editingOffer, dealer_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Till
                  </label>
                  <input
                    type="date"
                    value={editingOffer.valid_till ? editingOffer.valid_till.split('T')[0] : ''}
                    onChange={(e) => setEditingOffer({...editingOffer, valid_till: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, true);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {(editImagePreview || editingOffer.image_url) && (
                    <div className="mt-2">
                      <img 
                        src={editImagePreview || editingOffer.image_url} 
                        alt="Current offer image" 
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingOffer.is_active}
                  onChange={(e) => setEditingOffer({...editingOffer, is_active: e.target.checked})}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active Offer
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOffer(null);
                    setEditImagePreview(null);
                    setEditSelectedFile(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateOffer(editingOffer)}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Updating...' : 'Update Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}