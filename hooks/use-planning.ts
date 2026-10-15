"use client";

import { useEffect, useState } from "react";
import { getPlanning } from "@/lib/api";
import type { JourPlanning } from "@/lib/data/types";

/** Les jours du Planning, à partir d'aujourd'hui. */
export function usePlanning() {
  const [data, setData] = useState<JourPlanning[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getPlanning()
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  return { data, loading: !data && !error, error };
}
