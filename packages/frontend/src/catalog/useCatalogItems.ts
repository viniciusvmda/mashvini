import { useInfiniteQuery } from "@tanstack/react-query";
import { CATALOG_PAGE_SIZE, type CatalogPage } from "./catalogItem";

function useCatalogItems() {
  return useInfiniteQuery<CatalogPage>({
    queryKey: ["items", { size: CATALOG_PAGE_SIZE }],
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      (lastPage.page + 1) * lastPage.size < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
}

export { useCatalogItems };
