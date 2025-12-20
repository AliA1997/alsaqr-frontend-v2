import { makeAutoObservable } from "mobx";
import React from "react";
import { store } from ".";
import { prefetchModalData } from "@utils/workerFunctions/prefetchModalData";

export default class ModalStore {
    
    constructor() {
        makeAutoObservable(this);
    }
    
    loadingInitial = false;
    modalToShow: React.ReactNode | undefined = undefined;
    completeRegistrationModalShown = false;
    // showLoginModal = false;
    showModal = (modalToShow: React.ReactNode) => {
        if(store.authStore.currentSessionUser && store.authStore.currentSessionUser.id)
            prefetchModalData(store.authStore.currentSessionUser.id);
        
        this.modalToShow = modalToShow;
    }
    closeModal = () => {
        this.modalToShow = undefined;
    }
    setCompleteRegistrationModalShown = (val: boolean) => {
        this.completeRegistrationModalShown = val;
    }
}