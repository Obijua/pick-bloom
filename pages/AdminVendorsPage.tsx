
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Edit, Trash2, X, Image as ImageIcon, Upload, AlertTriangle, MapPin, Star } from 'lucide-react';
import { Vendor } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TableRowSkeleton } from '../components/Skeleton';

const vendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().min(1, "Vendor image is required"),
  // Allow empty string OR valid email
  contactEmail: z.union([z.string().email("Invalid email"), z.literal('')]).optional(),
  contactPhone: z.string().optional(),
  rating: z.number().min(0).max(5) // Removed default to align with VendorFormData expectations
});

type VendorFormData = z.infer<typeof vendorSchema>;

const AdminVendorsPage: React.FC = () => {
  const { vendors, addVendor, updateVendor, deleteVendor, isLoading, refreshStore } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-polling
  useEffect(() => {
      const interval = setInterval(() => {
          refreshStore();
      }, 10000); 
      return () => clearInterval(interval);
  }, []);

  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
      image: '',
      rating: 0,
      contactEmail: '',
      contactPhone: ''
    }
  });

  const previewImage = watch('image');

  const filteredVendors = vendors.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
      setEditingId(null);
      reset({
          name: '',
          location: '',
          description: '',
          image: '',
          rating: 0,
          contactEmail: '',
          contactPhone: ''
      });
      setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor: Vendor) => {
      setEditingId(vendor.id);
      reset({
          name: vendor.name,
          location: vendor.location,
          description: vendor.description,
          image: vendor.image,
          rating: vendor.rating,
          contactEmail: vendor.contactEmail || '',
          contactPhone: vendor.contactPhone || ''
      });
      setIsModalOpen(true);
  };

  const onSubmit = (data: VendorFormData) => {
      if (editingId) {
          updateVendor(editingId, data);
      } else {
          addVendor(data);
      }
      setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setValue('image', result, { shouldValidate: true });
        };
        reader.readAsDataURL(file);
    }
  };

  const confirmDelete = () => {
      if (deleteId) {
          deleteVendor(deleteId);
          setDeleteId(null);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <button 
              onClick={handleOpenAdd}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-sm"
          >
              <Plus className="h-5 w-5" /> Add Vendor
          </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="relative w-full sm:w-96">
              <input 
                  type="text" 
                  placeholder="Search vendors..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                      <tr>
                          <th className="px-6 py-4">Vendor</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Rating</th>
                          <th className="px-6 py-4">Description</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                      ) : filteredVendors.length > 0 ? (
                          filteredVendors.map((vendor) => (
                              <tr key={vendor.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                          <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                              <img src={vendor.image} alt="" className="h-full w-full object-cover" />
                                          </div>
                                          <span className="font-medium text-gray-900">{vendor.name}</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600">
                                      <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" /> {vendor.location}
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded w-fit">
                                          <Star className="h-3 w-3 fill-current" /> {vendor.rating}
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{vendor.description}</td>
                                  <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-2">
                                          <button 
                                              onClick={() => handleOpenEdit(vendor)}
                                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                          >
                                              <Edit className="h-4 w-4" />
                                          </button>
                                          <button 
                                              onClick={() => setDeleteId(vendor.id)}
                                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                          >
                                              <Trash2 className="h-4 w-4" />
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                  No vendors found. Add one to get started!
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                  <div className="flex justify-between items-center p-6 border-b border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                      <button onClick={() => setIsModalOpen(false)}><X className="h-6 w-6 text-gray-400 hover:text-gray-600" /></button>
                  </div>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                              <input 
                                {...register('name')} 
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} 
                                placeholder="e.g. Green Valley Farm"
                              />
                              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                          </div>
                          
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                              <input 
                                type="text" 
                                {...register('location')}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.location ? 'border-red-500' : 'border-gray-300'}`} 
                                placeholder="e.g. Kuje, Abuja"
                              />
                              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                          </div>

                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Rating</label>
                              <input 
                                type="number" 
                                step="0.1"
                                min="0"
                                max="5"
                                {...register('rating', { valueAsNumber: true })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" 
                              />
                          </div>

                          <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                              <div className="flex flex-col gap-4">
                                  <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        {...register('image')}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" 
                                        placeholder="Enter image URL or upload..." 
                                      />
                                      <input 
                                          type="file" 
                                          ref={fileInputRef}
                                          className="hidden"
                                          accept="image/*"
                                          onChange={handleImageUpload}
                                      />
                                      <button 
                                          type="button"
                                          onClick={() => fileInputRef.current?.click()}
                                          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2"
                                      >
                                          <Upload className="h-4 w-4" /> Upload
                                      </button>
                                  </div>
                                  
                                  {previewImage ? (
                                      <div className="relative h-48 w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group">
                                          <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                                          <button 
                                              type="button"
                                              onClick={() => setValue('image', '')}
                                              className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-red-50"
                                          >
                                              <Trash2 className="h-4 w-4" />
                                          </button>
                                      </div>
                                  ) : (
                                      <div className={`h-32 w-full bg-gray-50 rounded-lg border-2 border-dashed ${errors.image ? 'border-red-300' : 'border-gray-300'} flex flex-col items-center justify-center text-gray-400`}>
                                          <ImageIcon className="h-8 w-8 mb-2" />
                                          <span className="text-sm">No image selected</span>
                                      </div>
                                  )}
                                  {errors.image && <p className="text-red-500 text-xs">{errors.image.message}</p>}
                              </div>
                          </div>

                          <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Description</label>
                              <textarea 
                                rows={4} 
                                {...register('description')}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`} 
                              />
                              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                          </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700">Save Vendor</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Vendor</h3>
                <p className="text-center text-gray-500 mb-6">
                    Are you sure you want to delete this vendor? This might affect products linked to them.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setDeleteId(null)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorsPage;
