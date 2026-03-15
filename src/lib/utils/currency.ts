/**
 * Formats a number as Indian Rupees (INR)
 * @param price The price to format
 * @returns Formatted currency string (e.g., ₹1,299)
 */
export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return "₹0";
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) return "₹0";

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0, // Most INR prices don't show paise if they are whole numbers
  }).format(numericPrice);
}
