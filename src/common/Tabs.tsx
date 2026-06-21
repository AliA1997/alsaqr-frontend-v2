import { useCallback, useMemo, useRef, useState } from "react";
import { ModalLoader } from "./CustomLoader";
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
};

function Tabs({ tabs, showNumberOfRecords, loading, loadOnTabSwitch, containerClassNames }: TabsProps) {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState<string>(tabs[0].tabKey);
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
              key={tlIdx}
              onClick={() => handleTabSwitch(tl.tabKey)}
              activeInd={activeTab === tl.tabKey}
              animatedLink={false}
              testId={tl.testId ?? "tab"}
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
            key={tCIdx}
            id={`${tC.tabKey}`}
            className={`tab-content p-4 ${activeTab === tC.tabKey ? "" : "hidden" }  ${containerClassNames ? containerClassNames : ''}`}
          >

            {loading 
              ? <ModalLoader />
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
