"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FirstVisitRedirect() {
  const router = useRouter();

  useEffect(() => {
    const seen = localStorage.getItem("octopus_seen_intro");
    if (!seen) {
      router.replace("/how-it-works");
    }
  }, [router]);

  return null;
}