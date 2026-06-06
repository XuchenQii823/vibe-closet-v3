"use client";

import { useCallback, useEffect, useState } from "react";
import { Look } from "../closet/types";
import {
  getLooks,
  addLook as addLookFn,
  deleteLook as deleteLookFn,
  toggleLookFavorite as toggleLookFavFn,
  NewLookInput,
} from "../closet/looks";
import { QuotaError } from "../storage/localStore";

interface UseLooksResult {
  looks: Look[];
  ready: boolean;
  add: (input: NewLookInput) => Look | null;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  error: string | null;
  clearError: () => void;
}

/** 收藏册状态 hook（SSR 安全，挂载后读取 localStorage）。 */
export function useLooks(): UseLooksResult {
  const [looks, setLooks] = useState<Look[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLooks(getLooks());
    setReady(true);
  }, []);

  const add = useCallback((input: NewLookInput): Look | null => {
    try {
      const look = addLookFn(input);
      setLooks(getLooks());
      setError(null);
      return look;
    } catch (err) {
      setError(
        err instanceof QuotaError ? "存储已满，请删除部分搭配" : "保存失败"
      );
      return null;
    }
  }, []);

  const remove = useCallback((id: string) => {
    setLooks(deleteLookFn(id));
  }, []);

  const toggle = useCallback((id: string) => {
    setLooks(toggleLookFavFn(id));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { looks, ready, add, remove, toggle, error, clearError };
}
