
import React, { useLayoutEffect, useMemo, useRef } from "react";
const SideBar = React.lazy(() => import('./Sidebar'));
import Widgets from "./Widgets";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";
import {  RegisterModal } from "@common/AuthModals";
import { leadingDebounce } from "@utils/api/agent";

type PageContainerProps = {
  title?: string;
};


const PageContainer = ({
  children,
}: React.PropsWithChildren<PageContainerProps>) => {
  const location = useLocation();
  const isHomepage = useMemo(() => location.pathname === "/", [location.pathname]);
  const { authStore, modalStore } = useStore();
  const { currentSessionUser } = authStore;
  const { 
    completeRegistrationModalShown,
    modalToShow, 
    setCompleteRegistrationModalShown,
    showModal, 
  } = modalStore;
  const retryCount = useRef(0);

  useLayoutEffect(() => {
    
    if(currentSessionUser && !currentSessionUser.isCompleted && !completeRegistrationModalShown)
      leadingDebounce(() => {
        setCompleteRegistrationModalShown(true)
        showModal(<RegisterModal userInfo={currentSessionUser!} />);
      }, 15000);

    retryCount.current += 1;

    return () => {
      retryCount.current = 0;
    }
  }, [currentSessionUser])

  useLayoutEffect(() => {
    if (window.location.hash === "#_=_") {
      // Remove the fragment without refreshing the page
      history.replaceState 
        ? history.replaceState(null, "", " ")
        : window.location.hash = "";
    }
  }, [window.location.hash])

  return (
    <>
      <SideBar />
      <div className={`col-span-9 ${isHomepage ? 'lg:col-span-7' : 'lg:col-span-9'}`}>
        {children ? children : null}
      </div>
      {isHomepage && <Widgets />}
      {modalToShow && modalToShow}
    </>
  );
};
export default observer(PageContainer);
