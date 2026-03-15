import AddProductForm from "@/components/AddProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddProductPage() {
  return (
    <main className="min-h-screen pt-32 pb-16 container mx-auto px-6 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/admin/products" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 pb-2"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
        <p className="text-muted-foreground">Fill out the details below to add a new item to your store.</p>
      </div>

      <AddProductForm />
    </main>
  );
}
