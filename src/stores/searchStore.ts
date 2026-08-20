import { makeAutoObservable } from "mobx";
import { PostToDisplay, UserItemToDisplay } from "@typings";
import { PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import FeedState from "./base/feedState";

export default class SearchStore {

    usersFeed = new FeedState<UserItemToDisplay>((user) => user.id, { itemsPerPage: 25 });
    postsFeed = new FeedState<PostToDisplay>((post) => post.postId, { itemsPerPage: 25 });

    loadingPost = false;

    constructor() {
        makeAutoObservable(this);
    }

    // -- searched users feed surface --
    get searchedUsers() {
        return this.usersFeed.items;
    }
    get searchUsersLoadingInitial() {
        return this.usersFeed.loadingInitial;
    }
    get searchedUsersPredicate() {
        return this.usersFeed.predicate;
    }
    get searchedUsersPagingParams() {
        return this.usersFeed.pagingParams;
    }
    get searchedUsersPagination() {
        return this.usersFeed.pagination;
    }

    setSearchedUsersPredicate = this.usersFeed.setPredicate;
    setSearchedUsersPagingParams = (pagingParams: PagingParams) =>
        this.usersFeed.setPagingParams(pagingParams);
    setSearchedUsersPagination = this.usersFeed.setPagination;
    setSearchUsersLoadingInitial = this.usersFeed.setLoadingInitial;
    setSearchedUser = (userId: string, user: UserItemToDisplay) =>
        this.usersFeed.setItemByKey(userId, user);

    // -- searched posts feed surface --
    get searchedPosts() {
        return this.postsFeed.items;
    }
    get searchPostsLoadingInitial() {
        return this.postsFeed.loadingInitial;
    }
    get searchedPostsPredicate() {
        return this.postsFeed.predicate;
    }
    get searchedPostsPagingParams() {
        return this.postsFeed.pagingParams;
    }
    get searchedPostsPagination() {
        return this.postsFeed.pagination;
    }

    setSearchedPostsPredicate = this.postsFeed.setPredicate;
    setSearchedPostsPagingParams = (pagingParams: PagingParams) =>
        this.postsFeed.setPagingParams(pagingParams);
    setSearchedPostsPagination = this.postsFeed.setPagination;
    setSearchPostsLoadingInitial = this.postsFeed.setLoadingInitial;
    setSearchedPost = (postId: string, post: PostToDisplay) =>
        this.postsFeed.setItemByKey(postId, post);

    loadSearchedUsers = async () =>
        this.usersFeed.load((params) => agent.userApiClient.getUsersToAdd(params));

    // Was clearing searchUsersRegistry here -- a copy-paste slip that wiped the
    // user results whenever post results loaded. Each feed now owns its own.
    loadSearchedPosts = async () =>
        this.postsFeed.load((params) => agent.postApiClient.getPostsToAdd(params));
}
