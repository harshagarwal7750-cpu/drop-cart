"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Product } from "@prisma/client";

interface AddProductFormProps {
  initialData?: Product;
}

export default function AddProductForm({ initialData }: AddProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    originalPrice: initialData?.originalPrice?.toString() || "",
    flashSalePrice: initialData?.flashSalePrice?.toString() || "",
    category: initialData?.category || "Apparel",
    brand: initialData?.brand || "The Midnight Drop",
    images: initialData?.images ? JSON.parse(initialData.images).join("\n") : "",
    stock: initialData?.stock?.toString() || "0",
    featured: initialData?.featured || false,
    tags: initialData?.tags ? JSON.parse(initialData.tags).join(", ") : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Process images (split by newline) and tags (split by comma)
      const payload = {
        ...formData,
        images: formData.images.split("\n").map((s: string) => s.trim()).filter(Boolean),
        tags: formData.tags.split(",").map((s: string) => s.trim()).filter(Boolean),
      };

      const url = initialData ? `/api/products/${initialData.id}` : "/api/products";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-card/40 backdrop-blur-sm p-8 rounded-2xl border border-border">
      {error && <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="e.g. Midnight Eclipse Hoodie" />
        </div>

        <div className="space-y-4 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="Product details..." />
        </div>

        <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Price (₹) *</label>
            <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-background border border-border rounded-lg p-3 text-foreground" placeholder="2999" />
        </div>

        <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Original Price (₹)</label>
            <input type="number" step="0.01" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full bg-background border border-border rounded-lg p-3 text-foreground" placeholder="MSRP before discount" />
        </div>

        <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select required name="category" value={formData.category} onChange={handleChange} className="w-full bg-background border border-border rounded-lg p-3 text-foreground">
                <option value="Apparel">Apparel</option>
                <option value="Accessories">Accessories</option>
                <option value="Footwear">Footwear</option>
                <option value="Collectibles">Collectibles</option>
            </select>
        </div>

        <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
            <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-background border border-border rounded-lg p-3 text-foreground" />
        </div>

        <div className="space-y-4 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Image URLs (One per line)</label>
            <textarea name="images" value={formData.images} onChange={handleChange} rows={4} className="w-full bg-background border border-border rounded-lg p-3 text-foreground font-mono text-sm" placeholder="https://..." />
            <p className="text-xs text-muted-foreground">The first image will be used as the primary thumbnail.</p>
        </div>

        <div className="space-y-4 md:col-span-2 flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-border">
            <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
            <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Featured Product</label>
            <p className="text-xs text-muted-foreground ml-2">Show this product on the home page</p>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-border">
        <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-lg border border-border hover:bg-white/5 transition-colors">
            Cancel
        </button>
        <button type="submit" disabled={loading} className="px-6 py-3 rounded-lg bg-primary hover:bg-purple-600 text-white font-medium transition-colors disabled:opacity-50">
            {loading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
