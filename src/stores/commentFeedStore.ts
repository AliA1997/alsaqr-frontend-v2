import { makeAutoObservable, reaction, runInAction } from "mobx";
import { CommentForm, PostToDisplay } from "@typings";
import { Pagination, PagingParams } from "@models/common";
import agent from "@utils/api/agent";

export default class CommentFeedStore {

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.predicate.keys(),
            () => { }
        );
    }


    loadingInitial = false;
    loadingComment = false;
    loadingUpsert = false;
    predicate = new Map();
    setPredicate = (predicate: string, value: string | number | Date | undefined) => {
        if(value) {
            this.predicate.set(predicate, value);
        } else {
            this.predicate.delete(predicate);
        }
    }
    pagingParams: PagingParams = new PagingParams(1, 10);
    pagination: Pagination | undefined = undefined;
  
    commentsRegistry: Map<string, PostToDisplay> = new Map<string, PostToDisplay>();
    loadedComment: PostToDisplay | undefined;

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (value: Pagination | undefined) => {
        this.pagination = value;
    }
    setComment = (commentId: string, comment: PostToDisplay) => {
        this.commentsRegistry.set(commentId, comment);
    }

    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setLoadingComment = (value: boolean) => {
        this.loadingComment = value;
    }
    setLoadedComment = (val: PostToDisplay) => {
        this.loadedComment = val;
    }
    setLoadingUpsert = (value: boolean) => {
        this.loadingUpsert = value;
    }

    resetFeedState = () => {
        this.predicate.clear();
        this.commentsRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }
    
    
    loadComments = async (postId: string) => {

        this.setLoadingInitial(true);

        try {
            if(this.pagingParams.currentPage === 1)
                this.commentsRegistry.clear();
        
            const { items, pagination } = await agent.commentApiClient.getCommentsForPost(this.axiosParams, postId) ?? [];
            
            runInAction(() => {
                items.forEach((cmt: PostToDisplay) => {
                    this.setComment(cmt.postId, cmt);
                });
                
                this.setPagination(pagination);
            });

        } finally {
            this.setLoadingInitial(false);
        }

    }

    addComment = async (newComment: CommentForm) => {

        this.setLoadingUpsert(true);
        try {
            await agent.commentApiClient.addComment(newComment) ?? {};

        } finally {
            this.setLoadingUpsert(false);
        }

    }

    get comments() {
        return Array.from(this.commentsRegistry.values());
    }

}