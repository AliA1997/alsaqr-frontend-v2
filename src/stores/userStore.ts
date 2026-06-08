import agent from '@utils/api/agent';
import { makeAutoObservable, action } from 'mobx';
import { PagingParams } from '@models/common';
import { FollowUserFormDto, UnFollowUserFormDto } from '@models/users';

export default class UserStore {
    loadingInitial: boolean = false;
    loadingFollow: boolean = false;
    pagingParams = new PagingParams();
    constructor() {
        makeAutoObservable(this);
    }

    setLoadingInitial = (val: boolean) => {
        this.loadingInitial = val;
    };
    setLoadingFollow = (val: boolean) => {
        this.loadingFollow = val;
    }
    setPagingParams = (val: PagingParams) => {
        this.pagingParams = val;
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());

        return params;
    }

    navigateBackToHome = action(() => {
        window.location.href = `${import.meta.env.VITE_PUBLIC_BASE_URL}/`;
    });

    followUser = async (followedUserId: string) => {
        this.setLoadingFollow(true);
        try {
            const followUserDto: FollowUserFormDto = {
                userToFollowId: followedUserId
            };
            await agent.userApiClient.followUser(followUserDto);

        } finally {
            this.setLoadingFollow(false);
        }
    }

    unFollowUser = async (unFollowedUserId: string) => {
        this.setLoadingFollow(true);
        try {
            const unFollowUserDto: UnFollowUserFormDto = {
                userToUnFollowId: unFollowedUserId
            };
            await agent.userApiClient.unFollowUser(unFollowUserDto);

        } finally {
            this.setLoadingFollow(false);
        }
    }
}
