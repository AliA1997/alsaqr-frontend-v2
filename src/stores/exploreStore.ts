import { makeAutoObservable } from "mobx";
import type { ExploreToDisplay, PostToDisplay } from "@typings";
import { ExploreTabs } from '@enums';
import { PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import FeedState from "./base/feedState";

const NEWS_ITEMS_PERPAGE = 40;

/** News items have no id; the title is the natural key, as before. */
const newsFeed = () =>
    new FeedState<ExploreToDisplay>((newsItem) => newsItem.title, {
        itemsPerPage: NEWS_ITEMS_PERPAGE,
    });

export default class ExploreStore {

    // One feed per source. Previously all six loaders cleared exploreNewsRegistry
    // rather than their own registry, so loading any source wiped the Popular
    // feed while its own results accumulated forever.
    exploreNewsFeed = newsFeed();
    ajNewsFeed = newsFeed();
    argaamNewsFeed = newsFeed();
    bleacherReportNewsFeed = newsFeed();
    cryptoCoinNewsFeed = newsFeed();
    hackerNewsFeed = newsFeed();
    sabqNewsFeed = newsFeed();

    postsFeed = new FeedState<PostToDisplay>((post) => post.postId, { itemsPerPage: 25 });

    topicToExplore: string = '';

    constructor() {
        makeAutoObservable(this);
    }

    // -- explore posts feed surface --
    get explorePosts() {
        return this.postsFeed.items;
    }
    get pagingParams() {
        return this.postsFeed.pagingParams;
    }
    get pagination() {
        return this.postsFeed.pagination;
    }
    get predicate() {
        return this.postsFeed.predicate;
    }

    setPagingParams = (pagingParams: PagingParams) => this.postsFeed.setPagingParams(pagingParams);
    setPagination = this.postsFeed.setPagination;
    setPredicate = this.postsFeed.setPredicate;
    setSearchQry = (val: string) => this.postsFeed.setPredicate("searchQry", val);
    setExplorePost = (postId: string, post: PostToDisplay) =>
        this.postsFeed.setItemByKey(postId, post);
    resetExploreState = this.postsFeed.reset;

    // -- news feeds --
    /** True while any news source is loading, matching the old shared flag. */
    get loadingInitial() {
        return (
            this.exploreNewsFeed.loadingInitial ||
            this.ajNewsFeed.loadingInitial ||
            this.argaamNewsFeed.loadingInitial ||
            this.bleacherReportNewsFeed.loadingInitial ||
            this.cryptoCoinNewsFeed.loadingInitial ||
            this.hackerNewsFeed.loadingInitial ||
            this.sabqNewsFeed.loadingInitial
        );
    }
    get newsPagingParams() {
        return this.exploreNewsFeed.pagingParams;
    }
    get newsPagination() {
        return this.exploreNewsFeed.pagination;
    }

    setLoadingInitial = this.exploreNewsFeed.setLoadingInitial;
    setNewsPagingParams = (pagingParams: PagingParams) =>
        this.exploreNewsFeed.setPagingParams(pagingParams);
    setNewsPagination = this.exploreNewsFeed.setPagination;

    setExploreNewsItem = (newsItem: ExploreToDisplay) => this.exploreNewsFeed.setItem(newsItem);
    setAjNewsItem = (newsItem: ExploreToDisplay) => this.ajNewsFeed.setItem(newsItem);
    setArgaamNewsItem = (newsItem: ExploreToDisplay) => this.argaamNewsFeed.setItem(newsItem);
    setBleacherReportNewsItem = (newsItem: ExploreToDisplay) =>
        this.bleacherReportNewsFeed.setItem(newsItem);
    setCryptoCoinNewsItem = (newsItem: ExploreToDisplay) => this.cryptoCoinNewsFeed.setItem(newsItem);
    setHackerNewsItem = (newsItem: ExploreToDisplay) => this.hackerNewsFeed.setItem(newsItem);
    setSabqNewsItem = (newsItem: ExploreToDisplay) => this.sabqNewsFeed.setItem(newsItem);

    get exploreNews() {
        return this.exploreNewsFeed.items;
    }
    get ajNews() {
        return this.ajNewsFeed.items;
    }
    get argaamNews() {
        return this.argaamNewsFeed.items;
    }
    get bleacherReportNews() {
        return this.bleacherReportNewsFeed.items;
    }
    get cryptoCoinNews() {
        return this.cryptoCoinNewsFeed.items;
    }
    get hackerNews() {
        return this.hackerNewsFeed.items;
    }
    get sabqNews() {
        return this.sabqNewsFeed.items;
    }

    get widgetExploreNews() {
        return this.exploreNewsFeed.items.map((eN) => ({
            title: eN.title,
            link: eN.url,
        }));
    }

    loadExploreNews = async () =>
        this.exploreNewsFeed.load((params) => agent.exploreApiClient.getExplore(params));

    loadAjNews = async () => this.loadSource(this.ajNewsFeed, ExploreTabs.AlJazeeraEnglish);
    loadArgaamNews = async () => this.loadSource(this.argaamNewsFeed, ExploreTabs.Argaam);
    loadBleacherReportNews = async () =>
        this.loadSource(this.bleacherReportNewsFeed, ExploreTabs.BleacherReport);
    loadCryptoCoinNews = async () =>
        this.loadSource(this.cryptoCoinNewsFeed, ExploreTabs.CryptoCoinsNews);
    loadHackerNews = async () => this.loadSource(this.hackerNewsFeed, ExploreTabs.HackerNews);
    loadSabqNews = async () => this.loadSource(this.sabqNewsFeed, ExploreTabs.SABQ);

    private loadSource = (feed: FeedState<ExploreToDisplay>, source: ExploreTabs) =>
        feed.load((params) => agent.exploreApiClient.getExploreFromSource(source, params));
}
