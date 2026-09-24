import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { CatalogSkeleton } from "./CatalogSkeleton";
import { CatalogCard } from "./catalog-item/CatalogCard";
import { useCatalogItems } from "./useCatalogItems";
import { useInView } from "./useInView";

function Catalog() {
  const {
    data,
    isPending,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCatalogItems();
  const { ref: sentinelRef, isInView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Could not load the catalog");
    }
  }, [isError, error]);

  return (
    <div className="flex flex-col gap-6 p-4">
      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">MashVini</h1>
        <p className="text-muted-foreground">Select the items in the catalog</p>
      </header>

      {isPending ? (
        <CatalogSkeleton />
      ) : (
        data && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {data.pages.flatMap((page) =>
                page.data.map((item) => (
                  <CatalogCard key={item.id} item={item} />
                )),
              )}
            </div>
            <div ref={sentinelRef} />
            {isFetchingNextPage && (
              <div
                role="status"
                aria-label="Loading more items"
                className="flex justify-center"
              >
                <Loader2 className="animate-spin" />
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

export { Catalog };
