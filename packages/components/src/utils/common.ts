const ICON_REGISTRATION_PROMISE_KEY = Symbol.for('mache-hangar.icons.registration.promise');
const ICON_REGISTRATION_WARNED_KEY = Symbol.for('mache-hangar.icons.registration.warned');

type GlobalStore = Record<string | symbol, unknown>;

const getGlobalStore = (): GlobalStore => globalThis as GlobalStore;

const logIconRegistrationError = (error: unknown): void => {
  const store = getGlobalStore();
  if (store[ICON_REGISTRATION_WARNED_KEY]) {
    return;
  }

  store[ICON_REGISTRATION_WARNED_KEY] = true;

  if (typeof console !== 'undefined') {
    console.warn('[mache-hangar] Failed to register icon custom elements from @mache-hangar/icons/loader.', error);
  }
};

export const registerIconsGlobally = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  const store = getGlobalStore();
  const existingPromise = store[ICON_REGISTRATION_PROMISE_KEY] as Promise<void> | undefined;
  if (existingPromise) {
    return existingPromise;
  }

  const registrationPromise = import('@mache-hangar/icons/loader/index.js')
    .then(({ defineCustomElements }) => {
      defineCustomElements(window);
    })
    .catch((error: unknown) => {
      // Clear failed state so later calls can retry registration.
      delete store[ICON_REGISTRATION_PROMISE_KEY];
      logIconRegistrationError(error);
      throw error;
    });

  store[ICON_REGISTRATION_PROMISE_KEY] = registrationPromise;
  return registrationPromise;
};

export const warmupIconsRegistration = (): void => {
  void registerIconsGlobally().catch(() => undefined);
};

// 生成uuid的方法
export function uuid(): string {
  const str = '0123456789ABCDEFGHIKLMNOPQRSTUVWXYZ'; // 可以作为常量放到random外面
  const s: string[] = [];
  for (let i = 0; i < 36; i++) {
    const random = Math.random() * str.length + 'GF';
    s[i] = str[parseInt(random)];
  }
  s[8] = s[13] = s[18] = s[23] = '-';
  const uuid = s.join('');
  return uuid;
}

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number = 100): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function (...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
