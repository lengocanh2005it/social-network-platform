"use client";
import ForbiddenContent from "@/components/ForbiddenContent";
import LoadingComponent from "@/components/loading/LoadingComponent";
import { Suspense } from "react";

export default function ForbiddenPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ForbiddenContent />
    </Suspense>
  );
}
