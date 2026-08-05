import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Save, X, Check, Package, Globe, Apple, Smartphone, Star, StarOff, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useContent } from "../../context/ContentContext";

interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  appStoreUrl: string;
  playStoreUrl: string;
  features: string[];
  status: "live" | "beta" | "coming-soon";
  isFeatured: boolean;
}

const emptyProduct = (): Product => ({
  id: Date.now().toString(),
  name: "",
  tagline: "",
  description: "",
  websiteUrl: "",
  appStoreUrl: "",
  playStoreUrl: "",
  features: [],
  status: "live",
  isFeatured: false,
});

const STATUS_STYLES: Record<string, string> = {
  live: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  beta: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "coming-soon": "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",
};

export function AdminProducts() {
  const { content, updateContent, isLoading } = useContent();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setProducts((content as any).products || []);
    }
  }, [content, isLoading]);

  const saveAll = async (updated: Product[]) => {
    setIsSaving(true);
    const success = await updateContent({ ...content, products: updated } as any);
    setIsSaving(false);
    return success;
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
    setIsAdding(false);
  };

  const handleAddNew = () => {
    const np = emptyProduct();
    setEditForm(np);
    setEditingId(np.id);
    setIsAdding(true);
    setExpandedId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
    setIsAdding(false);
    setFeatureInput("");
  };

  const handleSave = async () => {
    if (!editForm) return;
    let updated: Product[];
    if (isAdding) {
      updated = [editForm, ...products];
    } else {
      updated = products.map((p) => (p.id === editForm.id ? editForm : p));
    }
    const success = await saveAll(updated);
    if (success) {
      setProducts(updated);
      setSavedId(editForm.id);
      setTimeout(() => setSavedId(null), 2000);
      handleCancel();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const updated = products.filter((p) => p.id !== id);
    const success = await saveAll(updated);
    if (success) setProducts(updated);
  };

  const handleToggleFeatured = async (id: string) => {
    const updated = products.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
    const success = await saveAll(updated);
    if (success) setProducts(updated);
  };

  const addFeature = () => {
    if (!featureInput.trim() || !editForm) return;
    setEditForm({ ...editForm, features: [...editForm.features, featureInput.trim()] });
    setFeatureInput("");
  };

  const removeFeature = (idx: number) => {
    if (!editForm) return;
    setEditForm({ ...editForm, features: editForm.features.filter((_, i) => i !== idx) });
  };

  if (isLoading) {
    return <div className="p-8 text-evolw-gray-500">Loading products...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 text-evolw-black dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-evolw-black dark:text-white">Products</h2>
          <p className="text-evolw-gray-500 dark:text-evolw-gray-400 text-sm sm:text-base">Manage products shown on the public website.</p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={isAdding}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-evolw-accent text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Add / Edit Form */}
      {editingId && editForm && (
        <div className="bg-white dark:bg-evolw-slate rounded-2xl sm:rounded-3xl border border-evolw-accent/30 shadow-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-5 border-b border-evolw-gray-100 dark:border-white/10 bg-evolw-accent/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-evolw-accent/10 rounded-lg shrink-0">
                <Package className="w-5 h-5 text-evolw-accent" />
              </div>
              <h3 className="font-bold text-base sm:text-lg truncate text-evolw-black dark:text-white">{isAdding ? "New Product" : `Editing: ${editForm.name || "…"}`}</h3>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button onClick={handleCancel} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 text-sm font-medium hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors text-evolw-black dark:text-white">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-evolw-accent text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? <span>Saving…</span> : <><Save className="w-4 h-4" /> Save Product</>}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-8 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">Product Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Fattakse"
                  className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all font-bold text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">Tagline</label>
                <input
                  type="text"
                  value={editForm.tagline}
                  onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                  placeholder="e.g. A Unit of Evolw"
                  className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">Description</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="A short paragraph describing what this product does..."
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all resize-none"
              />
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Website URL
                </label>
                <input
                  type="url"
                  value={editForm.websiteUrl}
                  onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                  placeholder="https://fattakse.in"
                  className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Apple className="w-4 h-4" /> App Store URL
                </label>
                <input
                  type="url"
                  value={editForm.appStoreUrl}
                  onChange={(e) => setEditForm({ ...editForm, appStoreUrl: e.target.value })}
                  placeholder="https://apps.apple.com/..."
                  className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Play Store URL
                </label>
                <input
                  type="url"
                  value={editForm.playStoreUrl}
                  onChange={(e) => setEditForm({ ...editForm, playStoreUrl: e.target.value })}
                  placeholder="https://play.google.com/..."
                  className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all text-sm"
                />
              </div>
            </div>

            {/* Status & Featured */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Product["status"] })}
                  className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all"
                >
                  <option value="live">🟢 Live</option>
                  <option value="beta">🟡 Beta</option>
                  <option value="coming-soon">⚪ Coming Soon</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">Featured on Products Page</label>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, isFeatured: !editForm.isFeatured })}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all font-medium ${
                    editForm.isFeatured
                      ? "border-evolw-accent bg-evolw-accent/10 text-evolw-accent"
                      : "border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-evolw-black text-evolw-gray-600 dark:text-gray-400"
                  }`}
                >
                  {editForm.isFeatured ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
                  {editForm.isFeatured ? "Featured (Highlighted on page)" : "Not Featured"}
                </button>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">Feature Highlights</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  placeholder="e.g. Local Commerce"
                  className="flex-1 px-4 py-2.5 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all text-sm"
                />
                <button onClick={addFeature} className="px-4 py-2.5 rounded-xl bg-evolw-accent text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {editForm.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editForm.features.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-evolw-gray-100 dark:bg-white/10 rounded-full text-sm font-medium">
                      {f}
                      <button onClick={() => removeFeature(i)} className="text-evolw-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-evolw-gray-500">Press Enter or click + to add. These appear as feature tags on the product page.</p>
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 && !isAdding ? (
        <div className="text-center py-24 bg-white dark:bg-evolw-slate rounded-3xl border border-evolw-gray-200 dark:border-white/5">
          <Package className="w-12 h-12 text-evolw-gray-300 dark:text-white/20 mx-auto mb-4" />
          <p className="text-xl font-bold text-evolw-black dark:text-white mb-2">No products yet</p>
          <p className="text-evolw-gray-500 mb-6">Click "Add Product" to create your first product listing.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white dark:bg-evolw-slate rounded-2xl border transition-all duration-300 overflow-hidden ${
                savedId === product.id
                  ? "border-green-400 dark:border-green-500"
                  : "border-evolw-gray-200 dark:border-white/5"
              }`}
            >
              {/* Product Card Header */}
              <div className="flex items-center gap-4 px-6 py-5">
                <div className="w-12 h-12 rounded-xl bg-evolw-accent/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-evolw-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-evolw-black dark:text-white truncate">{product.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[product.status]}`}>
                      {product.status.replace("-", " ")}
                    </span>
                    {product.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </span>
                    )}
                    {savedId === product.id && (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                        <Check className="w-3.5 h-3.5" /> Saved!
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-evolw-gray-500 mt-0.5 truncate">{product.tagline}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {product.websiteUrl && (
                    <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-evolw-gray-400 hover:text-evolw-accent hover:bg-evolw-gray-100 dark:hover:bg-white/10 transition-colors" title="Visit website">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleToggleFeatured(product.id)}
                    className={`p-2 rounded-lg transition-colors ${product.isFeatured ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20" : "text-evolw-gray-400 hover:text-yellow-500 hover:bg-evolw-gray-100 dark:hover:bg-white/10"}`}
                    title={product.isFeatured ? "Unfeature" : "Set as Featured"}
                  >
                    <Star className={`w-4 h-4 ${product.isFeatured ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                    className="p-2 rounded-lg text-evolw-gray-400 hover:bg-evolw-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    {expandedId === product.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-evolw-gray-200 dark:border-white/10 hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === product.id && (
                <div className="px-6 pb-5 border-t border-evolw-gray-100 dark:border-white/5 pt-4 space-y-3">
                  <p className="text-sm text-evolw-gray-600 dark:text-evolw-gray-400 leading-relaxed">{product.description}</p>
                  {product.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((f, i) => (
                        <span key={i} className="px-3 py-1 bg-evolw-gray-100 dark:bg-white/10 rounded-full text-xs font-medium">{f}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {product.websiteUrl && <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-evolw-accent underline">{product.websiteUrl}</a>}
                    {product.appStoreUrl && <a href={product.appStoreUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-evolw-accent underline">App Store</a>}
                    {product.playStoreUrl && <a href={product.playStoreUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-evolw-accent underline">Play Store</a>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
