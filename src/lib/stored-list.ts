import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage에 저장하는 작은 목록 상태. 같은 key를 쓰는 컴포넌트끼리 값이 동기화된다.
 * 처음 방문(key 없음)에는 seed를 보여준다. 저장소를 쓸 수 없으면 메모리에서만 유지한다.
 */
type Store<T> = {
  value: T[];
  listeners: Set<() => void>;
};

const stores = new Map<string, Store<unknown>>();

function readStorage<T>(key: string, seed: T[]): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return seed;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : seed;
  } catch {
    return seed;
  }
}

function getStore<T>(key: string, seed: T[]): Store<T> {
  let store = stores.get(key) as Store<T> | undefined;
  if (!store) {
    store = { value: readStorage(key, seed), listeners: new Set() };
    stores.set(key, store as Store<unknown>);
  }
  return store;
}

export function useStoredList<T>(key: string, seed: T[]) {
  const store = getStore(key, seed);

  const subscribe = useCallback(
    (listener: () => void) => {
      store.listeners.add(listener);
      return () => store.listeners.delete(listener);
    },
    [store],
  );

  const value = useSyncExternalStore(subscribe, () => store.value);

  const update = useCallback(
    (next: (current: T[]) => T[]) => {
      store.value = next(store.value);
      try {
        window.localStorage.setItem(key, JSON.stringify(store.value));
      } catch {
        // 시크릿 모드 등 저장 불가 환경: 메모리 값만 유지
      }
      store.listeners.forEach((listener) => listener());
    },
    [key, store],
  );

  return [value, update] as const;
}

type ValueStore<T> = {
  value: T;
  listeners: Set<() => void>;
};

const valueStores = new Map<string, ValueStore<unknown>>();

function getValueStore<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): ValueStore<T> {
  let store = valueStores.get(key) as ValueStore<T> | undefined;
  if (!store) {
    let value = fallback;
    try {
      const raw = window.localStorage.getItem(key);
      const parsed: unknown = raw === null ? null : JSON.parse(raw);
      if (isValid(parsed)) value = parsed;
    } catch {
      // 읽을 수 없으면 기본값
    }
    store = { value, listeners: new Set() };
    valueStores.set(key, store as ValueStore<unknown>);
  }
  return store;
}

/** localStorage에 저장하는 값 하나(객체·null 등). useStoredList와 같은 방식으로 동기화된다. */
export function useStoredValue<T>(key: string, fallback: T, isValid: (value: unknown) => value is T) {
  const store = getValueStore(key, fallback, isValid);

  const subscribe = useCallback(
    (listener: () => void) => {
      store.listeners.add(listener);
      return () => store.listeners.delete(listener);
    },
    [store],
  );

  const value = useSyncExternalStore(subscribe, () => store.value);

  const set = useCallback(
    (next: T) => {
      store.value = next;
      try {
        if (next === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // 저장 불가 환경: 메모리 값만 유지
      }
      store.listeners.forEach((listener) => listener());
    },
    [key, store],
  );

  return [value, set] as const;
}
