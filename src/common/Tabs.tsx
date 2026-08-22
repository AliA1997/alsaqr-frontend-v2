import { useCallback, useId, useMemo, useRef, useState } from "react";
import {  SkeletonLoader } from "./CustomLoader";
import { OptimizedImage } from "./Image";
import { ContentContainerWithRef } from "./Containers";
import { CommonLink } from "./Links";
import { NoRecordsTitle } from "./Titles";

type TabsProps = {
  tabs: {
    tabKey: string;
    title: string;
    image?: string;
    content: any[];
    noRecordsContent: string;
    renderer: (obj: any) => React.ReactNode;
    testId?: string;
  }[];
  showNumberOfRecords?: boolean;
  loading: boolean;
  loadOnTabSwitch?: (tab: string) => Promise<void>;
  containerClassNames?: string;
  ariaLabel?: string;
};

function Tabs({ tabs, showNumberOfRecords, loading, loadOnTabSwitch, containerClassNames, ariaLabel }: TabsProps) {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState<string>(tabs[0].tabKey);

  // Scopes the tab/panel element ids to this instance so the aria-controls and
  // aria-labelledby pairs stay unique when two tab sets are mounted at once.
  const instanceId = useId();
  const tabId = useCallback((tabKey: string) => `tab-${instanceId}-${tabKey}`, [instanceId]);
  const panelId = useCallback((tabKey: string) => `panel-${instanceId}-${tabKey}`, [instanceId]);
  const tabLinks = useMemo(
    () =>
      tabs.map((t) => ({
        tabKey: t.tabKey,
        title: t.title,
        testId: t.testId,
        image: t.image ?? undefined,
        numberOfRecords: t.content.length,
      })),
    [tabs]
  );
  const tabContents = useMemo(
    () =>
      tabs.map((t) => ({
        tabKey: t.tabKey,
        content: t.content,
        renderer: t.renderer,
        noRecordsContent: t.noRecordsContent
      })),
    [tabs]
  );
  const handleTabSwitch = useCallback((tab: string) => {
    setActiveTab(tab);
    if(loadOnTabSwitch)
      loadOnTabSwitch(tab);
  }, []);

  // Arrow/Home/End move between tabs and follow focus, per the ARIA tabs
  // pattern. Anything else falls through to CommonLink's Enter/Space handler.
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, currentIndex: number) => {
      const lastIndex = tabs.length - 1;
      let nextIndex: number | null = null;

      if (e.key === "ArrowRight") nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
      else if (e.key === "ArrowLeft") nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
      else if (e.key === "Home") nextIndex = 0;
      else if (e.key === "End") nextIndex = lastIndex;

      if (nextIndex === null) return;

      e.preventDefault();
      const nextTab = tabs[nextIndex];
      handleTabSwitch(nextTab.tabKey);
      document.getElementById(tabId(nextTab.tabKey))?.focus();
    },
    [tabs, handleTabSwitch, tabId]
  );

  // Horizontal drag-to-scroll for the tab bar.
  const tabBarRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  const onTabBarMouseDown = useCallback((e: React.MouseEvent) => {
    const el = tabBarRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
  }, []);

  const onTabBarMouseMove = useCallback((e: React.MouseEvent) => {
    const el = tabBarRef.current;
    if (!el || !dragState.current.isDown) return;
    e.preventDefault();
    const walk = e.pageX - el.offsetLeft - dragState.current.startX;
    if (Math.abs(walk) > 5) dragState.current.moved = true;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  }, []);

  const endTabBarDrag = useCallback(() => {
    dragState.current.isDown = false;
  }, []);

  // Swallow the click that fires after a drag so tabs don't switch mid-drag.
  const onTabBarClickCapture = useCallback((e: React.MouseEvent) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
    }
  }, []);
  return (
    <ContentContainerWithRef
      classNames={`
          text-center overflow-y-auto scrollbar-hide
          min-h-[100vh] max-h-[100vh]
          lg:max-w-4xl 
        `}
      innerRef={containerRef}
    >
      <div
        ref={tabBarRef}
        role="tablist"
        aria-label={ariaLabel ?? "Tabs"}
        onMouseDown={onTabBarMouseDown}
        onMouseMove={onTabBarMouseMove}
        onMouseUp={endTabBarDrag}
        onMouseLeave={endTabBarDrag}
        onClickCapture={onTabBarClickCapture}
        className={`
          flex flex-nowrap items-center gap-2 px-2 py-2
          overflow-x-auto scrollbar-hide
          border-b border-gray-100 dark:border-gray-800
          cursor-grab active:cursor-grabbing select-none
        `}
      >
        {tabLinks.map(
          (
            tl: { tabKey: string; title: string, image?: string; numberOfRecords: number, testId?: string },
            tlIdx: number
          ) => (
            <CommonLink
              key={`${tl.tabKey}-${tlIdx}`}
              onClick={() => handleTabSwitch(tl.tabKey)}
              activeInd={activeTab === tl.tabKey}
              animatedLink={false}
              testId={tl.testId ?? "tab"}
              role="tab"
              id={tabId(tl.tabKey)}
              ariaControls={panelId(tl.tabKey)}
              ariaSelected={activeTab === tl.tabKey}
              tabIndex={activeTab === tl.tabKey ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, tlIdx)}
              classNames={`shrink-0 whitespace-nowrap text-sm ${activeTab === tl.tabKey ? "font-semibold" : ""}`}
            >
              {tl.image ? (
                <OptimizedImage
                  src={tl.image}
                  alt={tl.title}
                />
              ) : <>{tl.title}</>}

              {showNumberOfRecords && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs ml-2">
                  {tl.numberOfRecords}
                </span>
              )}
            </CommonLink>
          )
        )}
      </div>
      {tabContents.map(
        (
          tC: {
            tabKey: string;
            content: any[];
            renderer: (obj: any) => React.ReactNode;
            noRecordsContent: string;
          },
          tCIdx: number
        ) => (
          <div
            key={`${tC.tabKey}-${tCIdx}`}
            id={panelId(tC.tabKey)}
            role="tabpanel"
            aria-labelledby={tabId(tC.tabKey)}
            tabIndex={0}
            className={`tab-content p-4 ${activeTab === tC.tabKey ? "" : "hidden" }  ${containerClassNames ? containerClassNames : ''}`}
          >

            {loading 
              ? <SkeletonLoader count={6} />
              : tC.content && tC.content.length ? (
                  tC.content.map(tC.renderer)
                ) : (
                  <NoRecordsTitle>{tC.noRecordsContent}</NoRecordsTitle>
                )
              }
          </div>
        )
      )}
    </ContentContainerWithRef>
  );
}

export default Tabs;
