import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-48 rounded-4xl" />
        <Skeleton className="h-48 rounded-4xl" />
        <Skeleton className="h-48 rounded-4xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 rounded-4xl" />
        <Skeleton className="h-28 rounded-4xl" />
        <Skeleton className="h-28 rounded-4xl" />
        <Skeleton className="h-28 rounded-4xl" />
      </div>
    </div>
  );
}
