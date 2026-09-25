type CatalogItem = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image_url: string;
};

type CatalogPage = {
  page: number;
  size: number;
  total: number;
  data: CatalogItem[];
};

const CATALOG_PAGE_SIZE = 8;

export type { CatalogItem, CatalogPage };
export { CATALOG_PAGE_SIZE };
