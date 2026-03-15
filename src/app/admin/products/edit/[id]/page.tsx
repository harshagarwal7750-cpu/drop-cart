import AddProductForm from "@/components/AddProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-32 pb-16 container mx-auto px-6 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/admin/products" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 pb-2"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
        <p className="text-muted-foreground">Updating: {product.name}</p>
      </div>

      <AddProductForm initialData={product} />
    </main>
  );
}
