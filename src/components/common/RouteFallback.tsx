import { Loader2 } from "lucide-react";

export function RouteFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px] py-16">
      <Loader2 className="w-6 h-6 animate-spin text-[#5B5FF5]" />
    </div>
  );
}
