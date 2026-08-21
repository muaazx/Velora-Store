import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Zap,
  X,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';
import { Product, Category } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { ImageUploader } from './ImageUploader';

export const AdminProducts: React.FC = () => {
  const { categories, refreshAllData } = useStore();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Edit/Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState<number>(99);
  const [discount, setDiscount] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(20);
  const [categoryId, setCategoryId] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [flashSalePrice, setFlashSalePrice] = useState<number>(79);
  const [featured, setFeatured] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.getProducts({ limit: 100, sortBy: 'newest' });
      setProducts(res.products);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProductId(null);
    setName('');
    setDescription('');
    setSku(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
    setBrand('');
    setPrice(99);
    setDiscount(0);
    setQuantity(25);
    setCategoryId(categories[0]?.id || '');
    setThumbnail('');
    setImages([]);
    setIsFlashSale(false);
    setFlashSalePrice(79);
    setFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.name);
    setDescription(p.description);
    setSku(p.sku);
    setBrand(p.brand);
    setPrice(p.price);
    setDiscount(p.discount);
    setQuantity(p.quantity);
    setCategoryId(p.categoryId);
    setThumbnail(p.thumbnail);
    setImages(p.images && p.images.length > 0 ? p.images : (p.thumbnail ? [p.thumbnail] : []));
    setIsFlashSale(Boolean(p.isFlashSale));
    setFlashSalePrice(p.flashSalePrice || Math.round(p.price * 0.7));
    setFeatured(Boolean(p.featured));
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!thumbnail && images.length === 0) {
      error('Image Required', 'Please upload at least one image or provide an image URL.');
      return;
    }

    const finalThumbnail = thumbnail || images[0];
    const finalImages = images.length > 0 ? images : [finalThumbnail];

    try {
      const payload = {
        name,
        description,
        sku,
        brand,
        price: Number(price),
        discount: Number(discount),
        quantity: Number(quantity),
        categoryId,
        thumbnail: finalThumbnail,
        images: finalImages,
        isFlashSale,
        flashSalePrice: isFlashSale ? Number(flashSalePrice) : undefined,
        featured,
      };

      if (editingProductId) {
        const updated = await api.updateProduct(editingProductId, payload);
        setProducts(prev => prev.map(p => p.id === editingProductId ? updated : p));
        success('Product Updated', `Saved changes for ${name}`);
      } else {
        const created = await api.createProduct(payload);
        setProducts(prev => [created, ...prev]);
        setSelectedCategory('all');
        setSearchQuery('');
        success('Product Created', `New product ${name} published`);
      }

      setIsModalOpen(false);
      await fetchProducts();
      await refreshAllData();
    } catch (err: any) {
      error('Failed to save product', err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      success('Product Deleted');
      await refreshAllData();
    } catch (err: any) {
      error('Delete failed', err.message);
    }
  };

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Inventory & Catalog Management
          </h1>
          <p className="text-zinc-500">
            Manage your store's listings, stocks, flash deals, and prices
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU, or brand..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold cursor-pointer dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category / SKU</th>
                <th className="py-3 px-4">Price / Discount</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Flash Deal</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnail}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-zinc-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-zinc-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300 block">
                      {p.category?.name || 'Unassigned'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{p.sku}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-black text-zinc-900 dark:text-white block">
                      {formatCurrency(p.price)}
                    </span>
                    {p.discount > 0 && (
                      <span className="text-[10px] font-bold text-orange-600">
                        -{p.discount}% OFF
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                        p.quantity <= 5
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {p.quantity <= 5 && <AlertTriangle className="w-3 h-3" />}
                      {p.quantity} in stock
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {p.isFlashSale ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 rounded font-bold text-[10px] flex items-center gap-1 w-max">
                        <Zap className="w-3 h-3 fill-red-600 text-red-600" />
                        {formatCurrency(p.flashSalePrice || 0)}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[11px]">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-zinc-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {editingProductId ? 'Edit Product Listing' : 'Add New Product Listing'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Brand</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Category</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Inventory Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                />
              </div>

              {/* Cloudinary Image Uploader */}
              <ImageUploader
                thumbnail={thumbnail}
                setThumbnail={setThumbnail}
                images={images}
                setImages={setImages}
              />

              {/* Flash Deal Config */}
              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/40 space-y-2">
                <label className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFlashSale}
                    onChange={e => setIsFlashSale(e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <span>Feature in Flash Sale Section</span>
                </label>
                {isFlashSale && (
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">
                      Flash Deal Special Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={flashSalePrice}
                      onChange={e => setFlashSalePrice(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
