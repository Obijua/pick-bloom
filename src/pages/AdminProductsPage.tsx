
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Filter, Edit, Trash2, X, Image as ImageIcon, Upload, AlertTriangle } from 'lucide-react';
import { Category, Product } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TableRowSkeleton } from '../components/Skeleton';

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.number().min(1, "Price must be positive"),
  stock: z.number().min(0, "Stock cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
  category: z.nativeEnum(Category),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().min(1, "Product image is required"), 
  vendorId: z.string().optional(), // Made Optional
  isSeasonal: z.boolean(),
  status: z.enum(['Active', 'Draft', 'Low Stock', 'Out of Stock'])
});

type ProductFormData = z.infer<typeof productSchema>;

const AdminProductsPage: React.FC = () => {
  const { products, vendors, deleteProduct, addProduct, updateProduct, isLoading, refreshStore } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Auto-polling
  useEffect(() => {
      const interval = setInterval(() => {
          refreshStore();
      }, 10000); 
      return () => clearInterval(interval);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Hook Form
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      stock: 0,
      unit: 'kg',
      category: Category.VEGETABLES,
      description: '',
      image: '',
      vendorId: '',
      isSeasonal: false,
      status: 'Active'
    }
  });

  // Watch image for preview
  const previewImage = watch('image');

  const filteredProducts = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchCat;
  });

  const handleOpenAdd = () => {
      setEditingId(null);
      reset({
          name: '',
          price: 0,
          stock: 10,
          unit: 'kg',
          category: Category.VEGETABLES,
          description: '',
          image: '',
          vendorId: '',
          isSeasonal: false,
          status: 'Active'
      });
      setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
      setEditingId(product.id);
      reset({
          name: product.name,
          price: product.price,
          stock: product.stock,
          unit: product.unit,
          category: product.category,
          description: product.description,
          image: product.image,
          vendorId: product.vendorId || '',
          isSeasonal: product.isSeasonal || false,
          status: product.status
      });
      setIsModalOpen(true);
  };

  const onSubmit = (data: ProductFormData) => {
      // If vendorId is empty string, make it undefined/null before sending if backend requires?
      // Since schema accepts optional string, empty string is valid "no vendor" marker or just omit it.
      const payload = {
          ...data,
          vendorId: data.vendorId || undefined // Send undefined if empty
      };

      if (editingId) {
          updateProduct(editingId, payload);
      } else {
          addProduct(payload);
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
          deleteProduct(deleteId);
          setDeleteId(null);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <button 
              onClick={handleOpenAdd}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-sm"
          >
              <Plus className="h-5 w-5" /> Add Product
          </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
              <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <div className="relative w-full sm:w-64">
              <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none bg-white"
              >
                  <option value="All">All Categories</option>
                  {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                      <tr>
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Stock</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                      ) : filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                          <img src={product.image} alt="" className="h-full w-full object-cover" />
                                      </div>
                                      <div>
                                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                                          <p className="text-xs text-gray-500">{product.unit}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{product.category}</td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                      <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                          <div className={`h-full ${product.stock < 10 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(product.stock, 100)}%` }}></div>
                                      </div>
                                      <span className="text-xs font-medium text-gray-700">{product.stock}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 font-bold text-gray-900">₦{product.price.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      product.status === 'Active' ? 'bg-green-100 text-green-800' :
                                      product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                                      product.status === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                  }`}>
                                      {product.status || 'Active'}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                      <button 
                                          onClick={() => handleOpenEdit(product)}
                                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      >
                                          <Edit className="h-4 w-4" />
                                      </button>
                                      <button 
                                          onClick={() => setDeleteId(product.id)}
                                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                          <Trash2 className="h-4 w-4" />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
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
                      <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                      <button onClick={() => setIsModalOpen(false)}><X className="h-6 w-6 text-gray-400 hover:text-gray-600" /></button>
                  </div>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                              <input 
                                {...register('name')} 
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} 
                              />
                              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                          </div>
                          
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                              <input 
                                type="number" 
                                {...register('price', { valueAsNumber: true })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`} 
                              />
                              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                          </div>

                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                              <input 
                                type="number" 
                                {...register('stock', { valueAsNumber: true })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.stock ? 'border-red-500' : 'border-gray-300'}`} 
                              />
                              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                          </div>

                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                              <select {...register('unit')} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                                  {['kg', 'bunch', 'piece', 'basket', 'crate', 'pack', 'jar'].map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit.message}</p>}
                          </div>

                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                              <select {...register('category')} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                                  {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                          </div>

                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (Optional)</label>
                              <select 
                                {...register('vendorId')} 
                                className={`w-full px-4 py-2 border rounded-lg bg-white ${errors.vendorId ? 'border-red-500' : 'border-gray-300'}`}
                              >
                                  <option value="">No Vendor (Sold by Market)</option>
                                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                              </select>
                              {errors.vendorId && <p className="text-red-500 text-xs mt-1">{errors.vendorId.message}</p>}
                          </div>
                          
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                              <select {...register('status')} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                                  {['Active', 'Draft', 'Low Stock', 'Out of Stock'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                          </div>

                          <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
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
                          
                          <div className="col-span-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" {...register('isSeasonal')} className="rounded text-primary-600 focus:ring-primary-500" />
                                  <span className="text-sm font-medium text-gray-700">Seasonal Product</span>
                              </label>
                          </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700">Save Product</button>
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
                <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Product</h3>
                <p className="text-center text-gray-500 mb-6">
                    Are you sure you want to delete this product? This action cannot be undone.
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

export default AdminProductsPage;
