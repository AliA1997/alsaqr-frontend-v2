// WidgetDataWorker orchestrator
import { store } from '@stores/index';
import { WidgetPrefetchPayloadData } from '@webWorkers/prefetchWidgetDataWorker';
import PrefetchWidgetDataWorker from '@webWorkers/prefetchWidgetDataWorker?worker';
import { ExploreToDisplay } from 'typings';

const worker = new PrefetchWidgetDataWorker();

export type WidgetPrefetchMessageEvent = {
    data: {
        type: any;
        payload: WidgetPrefetchPayloadData;
    }
};

export const prefetchWidgetData = () => {
    // Kick off the background fetch
    worker.postMessage({});

    worker.onmessage = (event: WidgetPrefetchMessageEvent) => {
        const { type, payload } = event.data;
        if (type === 'WIDGET_DATA_PREFETCHED' && payload) {
            payload.explore?.forEach((item: ExploreToDisplay) => store.exploreStore.setExploreNewsItem(item));
            payload.aj?.forEach((item: ExploreToDisplay) => store.exploreStore.setAjNewsItem(item));
            payload.argaam?.forEach((item: ExploreToDisplay) => store.exploreStore.setArgaamNewsItem(item));
            payload.bleacherReport?.forEach((item: ExploreToDisplay) => store.exploreStore.setBleacherReportNewsItem(item));
            payload.cryptoCoin?.forEach((item: ExploreToDisplay) => store.exploreStore.setCryptoCoinNewsItem(item));
            payload.hackerNews?.forEach((item: ExploreToDisplay) => store.exploreStore.setHackerNewsItem(item));
            payload.sabq?.forEach((item: ExploreToDisplay) => store.exploreStore.setSabqNewsItem(item));
        }
    };
};
