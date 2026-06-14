import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import SearchBar from "@common/SearchBar";
import type { ExploreToDisplay } from "@typings";

const NUM_HEADLINES = 5;

function pickRandom<T>(items: T[], count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function Widgets() {
  const { exploreStore, feedStore } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Combine the four sources; source is intentionally not surfaced to the user.
  const combinedNews: ExploreToDisplay[] = [
    ...exploreStore.ajNews,
    ...exploreStore.bleacherReportNews,
    ...exploreStore.hackerNews,
    ...exploreStore.cryptoCoinNews,
  ];

  // Re-shuffle only when the pool size changes (e.g. when prefetch lands).
  const headlines = useMemo(
    () => pickRandom(combinedNews, NUM_HEADLINES),
    [combinedNews.length]
  );

  const handleSearch = async () => {
    feedStore.setPredicate("searchTerm", searchTerm);
    await feedStore.loadPosts();
  };

  return (
    <div
      className="col-span-3 min-w-[100px] max-w-[300px] inline-flex "
      id="widgets"
    >
      <div className="overflow-y-auto sticky top-0 max-h-screen scrollbar-hide">
        <div className="m-4">
          <SearchBar
            fullWidth
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearch}
            placeholder="Search posts..."
            classNames="!p-0"
          />
        </div>

        <div className="max-w-sm rounded-lg bg-dim-700 overflow-hidden m-4 hover:shadow-md">
          <div className="flex">
            <div className="flex-1 m-2">
              <h2 className="px-1 py-2 text-xl w-48 font-semibold text-gray-700 dark:text-gray-200">
                What's happening
              </h2>
            </div>
          </div>

          <hr className="border-gray-800" />

          {headlines.length === 0 ? (
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading headlines…
              </p>
            </div>
          ) : (
            headlines.map((item, idx) => (
              <div key={`${item.title}-${idx}`}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-3 hover:bg-dim-500 transition"
                >
                  <h2 className="font-bold text-gray-700 dark:text-gray-200 hover:text-[#55a8c2]">
                    {item.title}
                  </h2>
                </a>
                {idx < headlines.length - 1 && (
                  <hr className="border-gray-800" />
                )}
              </div>
            ))
          )}
        </div>

        <div className="flow-root m-6">
          <div className="flex gap-6 text-sm">
            <a href="/privacy-policy" className="dark:hover:text-white hover:opacity-70 text-[#55a8c2]">
                Privacy
            </a>
            <a href="/terms-and-conditions" className="dark:hover:text-white hover:opacity-70 text-[#55a8c2]">
                Terms
            </a>
          </div>
          <div className="flex-2">
            <p className="text-sm leading-6 font-medium text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} AlSaqr. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default observer(Widgets);
