import { makeAutoObservable, runInAction } from "mobx";
import { PaginatedResult, Pagination, PagingParams } from "@models/common";
import type { ServerError } from "@typings";
import { store } from "..";

export type PredicateValue = string | number | Date;

/**
 * What a paginated endpoint hands back. The api layer returns `items` on most
 * routes, but the response interceptor in @utils/api/agent wraps bodies that
 * carry a pagination header into a PaginatedResult (`{ data, pagination }`), so
 * both shapes can reach the stores. `normalizePage` accepts either.
 */
export interface FeedPage<T> {
    items: T[];
    pagination: Pagination | undefined;
}

export type FeedLoader<T> = (
    params: URLSearchParams
) => Promise<FeedPage<T> | PaginatedResult<T[]> | T[] | undefined>;

/**
 * When the registry gets emptied on load.
 *  - "firstPage" (default): clear when loading page 1, append on later pages.
 *    This is what an infinite / virtualized feed wants.
 *  - "always": clear on every load, for feeds that render exactly one page.
 *  - "never": never clear implicitly; the caller drives it via `refresh`.
 */
export type ClearStrategy = "firstPage" | "always" | "never";

export interface FeedStateOptions {
    itemsPerPage?: number;
    /** Query params appended to every request, e.g. notifications' all=true. */
    staticParams?: Record<string, string>;
    clearStrategy?: ClearStrategy;
}

const serializePredicate = (value: PredicateValue): string =>
    value instanceof Date ? value.toISOString() : String(value);

const toServerError = (error: unknown): ServerError => {
    const response = (error as any)?.response;

    if (response) {
        return {
            statusCode: response.status,
            message: response.data?.message ?? response.statusText ?? "Request failed",
            details:
                typeof response.data === "string"
                    ? response.data
                    : JSON.stringify(response.data ?? {}),
        };
    }

    return {
        statusCode: 0,
        message: (error as any)?.message ?? String(error),
        details: "",
    };
};

const normalizePage = <T>(raw: any): FeedPage<T> => {
    if (!raw) return { items: [], pagination: undefined };

    // A bare array, no pagination header.
    if (Array.isArray(raw)) return { items: raw, pagination: undefined };

    // { items, pagination } -- the common case.
    if (Array.isArray(raw.items)) return { items: raw.items, pagination: raw.pagination };

    // PaginatedResult<T> from the response interceptor.
    if (Array.isArray(raw.data)) return { items: raw.data, pagination: raw.pagination };

    return { items: [], pagination: raw.pagination };
};

/**
 * The paginated-feed mechanics every feed store used to re-implement by hand:
 * predicate map, paging params, pagination, a keyed registry, axiosParams, the
 * loading flag, and error routing.
 *
 * Held as a field rather than extended, because makeAutoObservable refuses to
 * run on a class with a superclass or a subclass -- composition keeps every
 * store on the makeAutoObservable convention the codebase (and CLAUDE.md)
 * mandates, and lets one store own several feeds (lists + saved items,
 * messages + threads).
 */
export default class FeedState<T, K extends string | number = string> {
    loadingInitial = false;
    predicate = new Map<string, PredicateValue>();
    pagingParams: PagingParams;
    pagination: Pagination | undefined = undefined;
    registry = new Map<K, T>();
    /** Last failure for this feed, mirrored to commonStore for global display. */
    error: ServerError | undefined = undefined;

    // Config, not state. Public only because makeAutoObservable's annotation map
    // is keyed on public members, and these must be opted out of observability.
    readonly keyOf: (item: T) => K;
    readonly itemsPerPage: number;
    readonly staticParams: Record<string, string>;
    readonly clearStrategy: ClearStrategy;

    constructor(keyOf: (item: T) => K, options: FeedStateOptions = {}) {
        this.keyOf = keyOf;
        this.itemsPerPage = options.itemsPerPage ?? 25;
        this.staticParams = options.staticParams ?? {};
        this.clearStrategy = options.clearStrategy ?? "firstPage";
        this.pagingParams = new PagingParams(1, this.itemsPerPage);

        makeAutoObservable(this, {
            keyOf: false,
            itemsPerPage: false,
            staticParams: false,
            clearStrategy: false,
        });
    }

    get items(): T[] {
        return Array.from(this.registry.values());
    }

    get isEmpty(): boolean {
        return this.registry.size === 0;
    }

    get hasMore(): boolean {
        if (!this.pagination) return false;
        return this.pagination.currentPage < this.pagination.totalPages;
    }

    get axiosParams(): URLSearchParams {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());

        Object.entries(this.staticParams).forEach(([key, value]) => params.append(key, value));
        this.predicate.forEach((value, key) => params.append(key, serializePredicate(value)));

        return params;
    }

    // Preserves the falsy-deletes-the-key behaviour of every store's
    // hand-written setPredicate.
    setPredicate = (key: string, value: PredicateValue | undefined) => {
        if (value) {
            this.predicate.set(key, value);
        } else {
            this.predicate.delete(key);
        }
    };

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    };

    setPage = (currentPage: number, itemsPerPage?: number) => {
        this.pagingParams = new PagingParams(
            currentPage,
            itemsPerPage ?? this.pagingParams.itemsPerPage
        );
    };

    setPagination = (pagination: Pagination | undefined) => {
        this.pagination = pagination;
    };

    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    };

    setError = (error: ServerError | undefined) => {
        this.error = error;
    };

    setItem = (item: T) => {
        this.registry.set(this.keyOf(item), item);
    };

    setItemByKey = (key: K, item: T) => {
        this.registry.set(key, item);
    };

    getItem = (key: K): T | undefined => this.registry.get(key);

    removeItem = (key: K) => {
        this.registry.delete(key);
    };

    clearItems = () => {
        this.registry.clear();
    };

    /**
     * Full reset: predicate, registry, pagination and paging params. The
     * hand-written resets disagreed on whether paging params were included,
     * which left feeds stuck on a stale page after a reset; this always clears
     * them.
     */
    reset = () => {
        this.predicate.clear();
        this.registry.clear();
        this.pagination = undefined;
        this.pagingParams = new PagingParams(1, this.itemsPerPage);
        this.error = undefined;
    };

    /**
     * Runs `loader` with the current axiosParams and folds the page into the
     * registry. Never rejects: a failure is recorded on `error` here and on
     * commonStore.error, so a failed feed no longer produces an unhandled
     * rejection while silently rendering as empty.
     */
    load = async (loader: FeedLoader<T>, opts?: { refresh?: boolean }) => {
        this.setLoadingInitial(true);
        this.setError(undefined);

        if (opts?.refresh) {
            runInAction(() => {
                this.registry.clear();
                this.pagingParams = new PagingParams(1, this.itemsPerPage);
            });
        } else if (
            this.clearStrategy === "always" ||
            (this.clearStrategy === "firstPage" && this.pagingParams.currentPage === 1)
        ) {
            runInAction(() => this.registry.clear());
        }

        try {
            const { items, pagination } = normalizePage<T>(await loader(this.axiosParams));

            runInAction(() => {
                items.forEach((item) => this.setItem(item));
                this.pagination = pagination;
            });
        } catch (error) {
            const serverError = toServerError(error);
            runInAction(() => {
                this.error = serverError;
                store.commonStore.setServerError(serverError);
            });
        } finally {
            runInAction(() => this.setLoadingInitial(false));
        }
    };
}
