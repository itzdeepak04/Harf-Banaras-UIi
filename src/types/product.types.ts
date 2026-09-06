export interface Product {
  _id: string;
  sku: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  fabric: string;
  weave: string;
  workType: string;
  colour: string;
  pattern: string;
  zariDetails: string;
  workIntensity: 'light' | 'medium' | 'heavy';
  sellingPrice: number;
  discountPrice: number;
  availableQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  images: string[];
  imagePaths?: string[];
  imageUrls?: string[];
  videoUrl?: string;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  status: 'draft' | 'published' | 'archived' | 'discontinued';
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
