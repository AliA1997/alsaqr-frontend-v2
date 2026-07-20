import React, { forwardRef, useCallback, useMemo } from "react";
import { Virtuoso, VirtuosoGrid } from "react-virtuoso";
import { Pagination } from "@models/common";
import { SkeletonLoader } from "@common/CustomLoader";
import { NoRecordsTitle } from "@common/Titles";

// Server-driven pagination: more items exist when the pages loaded so far
// haven't covered totalItems yet.
export function hasMoreFeedItems(pagination: Pagination | undefined) {
  const currentPage = pagination?.currentPage ?? 1;
  const itemsPerPage = pagination?.itemsPerPage ?? 25;
  const totalItems = pagination?.totalItems ?? 0;

  return currentPage * itemsPerPage < totalItems;
}

interface FeedContext {
  loading: boolean;
}

interface VirtualizedFeedProps<T> {
  items: T[];
  pagination: Pagination | undefined;
  loading: boolean;
  onEndReached: (nextPage: number) => void | Promise<void>;
  itemContent: (index: number, item: T) => React.ReactNode;
  computeItemKey?: (index: number, item: T) => string | number;
  emptyText: string;
  height?: string;
  testId?: string;
}

const FeedFooter = ({ context }: { context?: FeedContext }) =>
  context?.loading ? (
    <div className="py-2 dark:text-gray-500 italic">
      <SkeletonLoader count={1} />
    </div>
  ) : null;

const flatComponents = { Footer: FeedFooter };

/**
 * Flat virtualized feed (posts, comments, users, notifications).
 * Replaces the previous IntersectionObserver + LoadMoreTrigger pattern:
 * react-virtuoso only mounts the visible rows and fires `endReached`
 * when the user hits the end of the loaded list.
 */
export function VirtualizedFeed<T>({
  items,
  pagination,
  loading,
  onEndReached,
  itemContent,
  computeItemKey,
  emptyText,
  height = "100vh",
  testId,
}: VirtualizedFeedProps<T>) {
  const handleEndReached = useCallback(() => {
    if (loading || !hasMoreFeedItems(pagination)) return;

    void onEndReached((pagination?.currentPage ?? 1) + 1);
  }, [loading, pagination, onEndReached]);

  if (!loading && (!items || !items.length))
    return <NoRecordsTitle>{emptyText}</NoRecordsTitle>;

  return (
    <Virtuoso
      style={{ height }}
      className="scrollbar-hide"
      data={items}
      context={{ loading }}
      endReached={handleEndReached}
      increaseViewportBy={200}
      computeItemKey={computeItemKey}
      itemContent={itemContent}
      components={flatComponents}
      data-testid={testId ?? "feedcontaineritems"}
    />
  );
}

// Grid pieces are hoisted (created once per width-class set) so Virtuoso
// doesn't remount the whole subtree on every render.
const GridList = forwardRef<HTMLDivElement, any>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ style, children, context: _context, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      style={style}
      className="flex flex-wrap md:justify-start"
    >
      {children}
    </div>
  )
);
GridList.displayName = "VirtualizedGridList";

const gridItemCache = new Map<string, React.ComponentType<any>>();

function getGridItem(itemClassNames: string) {
  let GridItem = gridItemCache.get(itemClassNames);
  if (!GridItem) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    GridItem = ({ children, context: _context, ...props }: any) => (
      <div {...props} className={itemClassNames}>
        {children}
      </div>
    );
    (GridItem as any).displayName = "VirtualizedGridItem";
    gridItemCache.set(itemClassNames, GridItem);
  }
  return GridItem;
}

interface VirtualizedCardFeedProps<T> extends VirtualizedFeedProps<T> {
  // Responsive width/spacing classes for each grid cell; the card inside
  // should render `fitParent` (w-full) so the cell owns the layout.
  itemClassNames: string;
}

/**
 * Card-grid virtualized feed (lists, communities, community discussions).
 * Reproduces the previous `flex flex-wrap` card layout while only
 * mounting the visible cards.
 */
export function VirtualizedCardFeed<T>({
  items,
  pagination,
  loading,
  onEndReached,
  itemContent,
  computeItemKey,
  emptyText,
  height = "100vh",
  testId,
  itemClassNames,
}: VirtualizedCardFeedProps<T>) {
  const handleEndReached = useCallback(() => {
    if (loading || !hasMoreFeedItems(pagination)) return;

    void onEndReached((pagination?.currentPage ?? 1) + 1);
  }, [loading, pagination, onEndReached]);

  const gridComponents = useMemo(
    () => ({
      List: GridList,
      Item: getGridItem(itemClassNames),
      Footer: FeedFooter,
    }),
    [itemClassNames]
  );

  if (!loading && (!items || !items.length))
    return <NoRecordsTitle>{emptyText}</NoRecordsTitle>;

  return (
    <VirtuosoGrid
      style={{ height }}
      className="scrollbar-hide"
      data={items}
      context={{ loading }}
      endReached={handleEndReached}
      increaseViewportBy={200}
      computeItemKey={computeItemKey}
      itemContent={itemContent}
      components={gridComponents}
      data-testid={testId ?? "feedcontaineritems"}
    />
  );
}

export default VirtualizedFeed;
