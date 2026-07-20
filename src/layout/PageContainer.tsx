
import React, { useLayoutEffect, useMemo } from "react";
const SideBar = React.lazy(() => import('./Sidebar'));
import Widgets from "./Widgets";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";
import {  RegisterModal } from "@common/AuthModals";
// import { leadingDebounce } from "@utils/api/agent";
import { useCheckSession } from "@hooks/useCheckSession";

type PageContainerProps = {
  title?: string;
};


const PageContainer = ({
  children,
}: React.PropsWithChildren<PageContainerProps>) => {
  const location = useLocation();
  
  const isHomepage = useMemo(() => location.pathname === "/", [location.pathname]);

  const { authStore, modalStore } = useStore();
  const {
    setCurrentSessionUser, 
    resetAuthState,
    currentSessionUser, 
    auth,
  } = authStore;
  const { 
    completeRegistrationModalShown,
    modalToShow, 
    setCompleteRegistrationModalShown,
    showModal, 
  } = modalStore;

  const openCompleteRegistrationModal = (userInfo: {[key: string]: any }) => {
    setCompleteRegistrationModalShown(true);
    showModal(<RegisterModal userInfo={userInfo} />);
  }

  useLayoutEffect(() => {
    if (window.location.hash === "#_=_") {
      // Remove the fragment without refreshing the page
      history.replaceState 
        ? history.replaceState(null, "", " ")
        : window.location.hash = "";
    }
  }, [window.location.hash])

  useCheckSession(
    auth,
    setCurrentSessionUser, 
    resetAuthState,
    currentSessionUser,
    openCompleteRegistrationModal,
    completeRegistrationModalShown
  );

  return (
    <>
      <SideBar />
      <div className={`col-span-9 min-w-0 ${isHomepage ? 'lg:col-span-7' : 'lg:col-span-9'}`}>
        {children ? children : null}
      </div>
      {isHomepage && <Widgets />}
      {modalToShow && modalToShow}
    </>
  );
};
export default observer(PageContainer);
