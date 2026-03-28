import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function PackageListLoading() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    </section>
  );
}

export function PackageDetailLoading() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-6 h-5 w-32" />
      <Card className="p-6">
        <Skeleton className="h-7 w-40" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      </Card>
      <Card className="mt-6 p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-4 pb-6 last:pb-0">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}
