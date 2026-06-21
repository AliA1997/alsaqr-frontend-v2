// Ported from alsaqr-zook (https://github.com/AliA1997/alsaqr-zook)
export interface ProductRecord {
  id: number;
  userId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  slug: string;
  attributes: { [key: string]: any };
  tags: string[];
  productCategoryId: number;
  category: string;
  latitude: number;
  longitude: number;
}
