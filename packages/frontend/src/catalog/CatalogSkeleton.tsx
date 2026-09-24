import { Skeleton } from "@/ui/skeleton";

const SKELETON_CARD_IDS = Array.from(
  { length: 12 },
  (_, index) => `catalog-skeleton-card-${index}`,
);

function CatalogSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading catalog"
      className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
    >
      {SKELETON_CARD_IDS.map((id) => (
        <Skeleton key={id} className="aspect-square w-full" />
      ))}
    </div>
  );
}

export { CatalogSkeleton };
