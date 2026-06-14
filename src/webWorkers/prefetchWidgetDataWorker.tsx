// WidgetDataWorker — prefetches news from all explore sources off the main thread
import agent from "@utils/api/agent";

enum ExploreTabs {
  Popular = 'popular',
  AlJazeeraEnglish = 'al-jazeera-english',
  Argaam = 'argaam',
  BleacherReport = 'bleacher-report',
  CryptoCoinsNews = 'crypto-coins-news',
  HackerNews = 'hacker-news',
  SABQ = 'sabq',
}

export type WidgetPrefetchPayloadData = {
    explore: any[];
    aj: any[];
    argaam: any[];
    bleacherReport: any[];
    cryptoCoin: any[];
    hackerNews: any[];
    sabq: any[];
};

if (typeof self !== 'undefined') {
    (self as any).global = self;
}

// Prevent polyfill crashing
(self as any).__vite_plugin_react_preamble_installed__ = true;

function defineNewsUrlParams() {
    const params = new URLSearchParams();
    params.append("currentPage", "1");
    params.append("itemsPerPage", "10");

    return params;
}

// Widget Data Worker
self.onmessage = async () => {
    let result: WidgetPrefetchPayloadData | null = null;

    try {
        const [
            explore,
            aj,
            argaam,
            bleacherReport,
            cryptoCoin,
            hackerNews,
            sabq,
        ] = await Promise.all([
            agent.exploreApiClient.getExplore(defineNewsUrlParams()),
            agent.exploreApiClient.getExploreFromSource(ExploreTabs.AlJazeeraEnglish, defineNewsUrlParams()),
            agent.exploreApiClient.getExploreFromSource(ExploreTabs.Argaam, defineNewsUrlParams()),
            agent.exploreApiClient.getExploreFromSource(ExploreTabs.BleacherReport, defineNewsUrlParams()),
            agent.exploreApiClient.getExploreFromSource(ExploreTabs.CryptoCoinsNews, defineNewsUrlParams()),
            agent.exploreApiClient.getExploreFromSource(ExploreTabs.HackerNews, defineNewsUrlParams()),
            agent.exploreApiClient.getExploreFromSource(ExploreTabs.SABQ, defineNewsUrlParams()),
        ]);

        result = {
            explore: explore.items,
            aj: aj.items,
            argaam: argaam.items,
            bleacherReport: bleacherReport.items,
            cryptoCoin: cryptoCoin.items,
            hackerNews: hackerNews.items,
            sabq: sabq.items,
        };
    } catch {
        console.log("Error prefetching widget news data.");
    }

    self.postMessage({ type: 'WIDGET_DATA_PREFETCHED', payload: result });
};
