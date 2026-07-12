import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { RouteFallback } from "./components/common/RouteFallback";

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}