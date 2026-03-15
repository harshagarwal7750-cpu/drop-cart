export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/currency";
import { Plus, Edit, Trash2 } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      category: true,
      images: true,
    }
  });

  return (
    <main className="min-h-screen pt-32 pb-16 container mx-auto px-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Management</h1>
          <p className="text-muted-foreground">Manage your storefront inventory.</p>
        </div>
        <Link 
          href="/admin/products/add" 
          className="flex items-center gap-2 bg-primary hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg shadow-purple-900/20"
        >
          <Plus size={20} /> Add Product
        </Link>
      </div>

      <div className="bg-card/40 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Product</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Category</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Price (INR)</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Stock</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No products found. Add one to get started.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#25252b] overflow-hidden relative border border-border">
                            <img 
                                src={product.images ? JSON.parse(product.images)[0] : "/placeholder-product.jpg"} 
                                alt={product.name}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        {product.name}
                    </td>
                    <td className="p-4 text-muted-foreground">{product.category}</td>
                    <td className="p-4 font-medium">{formatPrice(Number(product.price))}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        product.stock > 10 ? 'bg-green-500/10 text-green-500' : 
                        product.stock > 0 ? 'bg-orange-500/10 text-orange-500' : 
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 flex gap-3 justify-end">
                      <Link 
                        href={`/admin/products/edit/${product.id}`}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-white/5 rounded-md"
                      >
                        <Edit size={18} />
                      </Link>
                      <button className="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-white/5 rounded-md">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
