import { prisma } from '@/lib/prisma';
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import { formatPrice } from "@/lib/utils/currency";
import { FadeIn } from "@/components/FadeIn";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!product) {
    notFound();
  }

  // Parse Images safely
  let images: string[] = ["/placeholder-product.jpg"];
  if (product.images) {
      try {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed) && parsed.length > 0) {
              images = parsed;
          }
      } catch (e) {
          // Fallback to placeholder on JSON error
      }
  }

  return (
    <main className="min-h-screen pt-32 pb-24 container mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Left Col: Image Gallery */}
        <FadeIn delay={0.1} className="flex flex-col gap-4">
          <div className="relative w-full aspect-square bg-[#25252b] rounded-3xl overflow-hidden border border-border">
            <Image 
              src={images[0]} 
              alt={product.name} 
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {images.length > 1 && (
             <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {images.slice(1).map((img, i) => (
                    <div key={i} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors">
                        <Image src={img} alt={`${product.name} ${i+2}`} fill className="object-cover" />
                    </div>
                ))}
             </div>
          )}
        </FadeIn>

        {/* Right Col: Product Info */}
        <div className="flex flex-col pt-6 lg:pt-10">
          <FadeIn delay={0.2} className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">{product.brand}</span>
            {product.stock <= 5 && product.stock > 0 && (
                <span className="text-xs font-bold bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full">Only {product.stock} left in stock</span>
            )}
            {product.stock === 0 && (
                <span className="text-xs font-bold bg-destructive/10 text-destructive px-3 py-1 rounded-full">Out of Stock</span>
            )}
          </FadeIn>

          <FadeIn delay={0.3}>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400">
              {product.name}
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.4} className="flex items-end gap-3 mb-8 pb-8 border-b border-border">
            <p className="text-3xl font-bold text-primary">{formatPrice(Number(product.price))}</p>
            {product.originalPrice && (
                <p className="text-lg text-muted-foreground line-through mb-1">
                    {formatPrice(Number(product.originalPrice))}
                </p>
            )}
            {product.flashSalePrice && (
                 <span className="ml-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-1">Flash Sale</span>
            )}
          </FadeIn>
          
          <FadeIn delay={0.5} className="prose prose-invert prose-p:text-muted-foreground prose-p:font-light prose-p:leading-relaxed max-w-none mb-10 text-lg">
            <p>{product.description}</p>
          </FadeIn>

          <FadeIn delay={0.6} className="mt-auto space-y-4">
            <AddToCartButton 
                product={product} 
                className="w-full bg-foreground text-background hover:bg-neutral-200 font-semibold py-4 px-8 rounded-full text-lg shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
            />
            <p className="text-sm text-center text-muted-foreground font-light">
              Free nationwide express shipping on orders over ₹5,000.
            </p>
          </FadeIn>
        </div>
      </div>
    </main>
  );
}
