import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function PackageListLoading() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:mb-8 sm:px-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid gap-4 sm:gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function PackageDetailLoading() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <Skeleton className="mb-6 h-5 w-32" />
        <Card className="p-5 sm:p-6">
          <Skeleton className="h-7 w-40" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
        </Card>
        <Card className="mt-5 p-5 sm:mt-6 sm:p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-4 pb-6 last:pb-0">
              <Skeleton className="mt-1 h-7 w-7 rounded-full" />
              <div className="flex-1 space-y-2 rounded-xl">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}
