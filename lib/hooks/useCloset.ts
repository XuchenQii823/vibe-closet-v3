"use client";

import { useCallback, useEffect, useState } from "react";
import { ClosetItem } from "../closet/types";
import {
  getItems,
  addItem as addItemFn,
  deleteItem as deleteItemFn,
  toggleFavorite as toggleFavoriteFn,
  NewItemInput,
} from "../closet/items";
import { isStorageAvailable, QuotaError } from "../storage/localStore";

interface UseClosetResult {
  items: ClosetItem[];
  ready: boolean;
  storageOk: boolean;
  add: (input: NewItemInput) => ClosetItem | null;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  /** 最近一次操作的错误（如存储已满），UI 据此提示。 */
  error: string | null;
  clearError: () => void;
}

/**
 * 衣橱状态 hook：把 storage + domain 纯函数包成 React 状态。
 * SSR 安全：首渲染返回空数组，挂载后再从 localStorage 读取，避免 hydration mismatch。
 */
export function useCloset(): UseClosetResult {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStorageOk(isStorageAvailable());
    setItems(getItems());
    setReady(true);
  }, []);

  const add = useCallback((input: NewItemInput): ClosetItem | null => {
    try {
      const item = addItemFn(input);
      setItems(getItems());
      setError(null);
      return item;
    } catch (err) {
      const msg =
        err instanceof QuotaError
          ? "存储已满，请删除部分单品后重试"
          : "保存失败，请重试";
      setError(msg);
      return null;
    }
  }, []);

  const remove = useCallback((id: string) => {
    setItems(deleteItemFn(id));
  }, []);

  const toggle = useCallback((id: string) => {
    setItems(toggleFavoriteFn(id));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { items, ready, storageOk, add, remove, toggle, error, clearError };
}
