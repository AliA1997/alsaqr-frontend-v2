import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  DotsCircleHorizontalIcon,
  LoginIcon,
  LogoutIcon
} from "@heroicons/react/outline";
import { useStore } from "@stores/index";
import { useLocation, useNavigate } from 'react-router-dom';

import { observer } from "mobx-react-lite";
import { LoginModal } from "@common/AuthModals";

import { ROUTE_TO_SHOW_SETTINGS_SIDEBAR, ROUTES_USER_CANT_ACCESS } from "@utils/constants";
import { SettingsTabs, SidebarTabs } from "@models/enums";
import SidebarRow from "./SidebarRow";
import DarkSwitch from "./DarkSwitch";
import { UserProfileLink } from "@common/Links";

type SideBarProps = {};

const SideBar = ({ }: SideBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authStore, commonStore, modalStore, settingsStore } = useStore();
  const { auth, currentSessionUser } = authStore;
  const { currentTab, setCurrentTab } = commonStore;
  const { closeModal, showModal } = modalStore;
  const { currentTabIdx, setCurrentTabIdx } = settingsStore;

  const [mounted, setMounted] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const notLoggedIn = useMemo(() => mounted && !auth?.isLoggedIn(), [auth?.isLoggedIn(), mounted]);
  const hideSidebar = useMemo(() => ROUTE_TO_SHOW_SETTINGS_SIDEBAR === location.pathname, [location.pathname]);
  const registrationNotCompleted = useMemo(() => !(currentSessionUser?.isCompleted ?? false), [mounted, currentSessionUser])

  const openModal = () => showModal(<LoginModal />)
  const handleDropdownEnter = useCallback(
    () => setIsDropdownOpen(!isDropdownOpen),
    [isDropdownOpen]
  );

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    }
  }, []);

  useLayoutEffect(() => {
    const showLoginModal = ROUTES_USER_CANT_ACCESS.some(r => location.pathname.includes(r));

    if (notLoggedIn && showLoginModal) {
      showModal(<LoginModal />);
    }

    if (!registrationNotCompleted && currentSessionUser)
      closeModal();

  }, [currentSessionUser?.id, mounted]);

  const profileInfo = useMemo(() => {
    if(import.meta.env.VITE_PUBLIC_IS_TEST_MODE && auth?.isLoggedIn()) 
      return auth.getUser();
    else if(currentSessionUser && currentSessionUser.id)
      return currentSessionUser;
    else
      return null;
  }, [auth]);

  return (
    <>
      <div className={`
          ${hideSidebar ? 'col-span-2' : 'col-span-1 md:col-span-2'}
          flex flex-col item-center mt-2 md:mt-0 md:px-4 md:items-start
        `}
        onClick={() => setIsDropdownOpen(false)}
      >
        <div className="flex justify-start">
          <img
            data-testid="navlogo"
            className={`
              m-0 h-full w-full md:w-[90%] transition-all duration-200 
              sidebarLogo
              cursor-pointer
          `}
            alt=""
            style={{ maxWidth: "unset" }}
            onClick={() => navigate("/")}
          />
        </div>
        <>
          {hideSidebar
            ? (
              <>
                <SidebarRow active={currentTabIdx === SettingsTabs.PersonalInfo} overrideOnClick={true} isShow={true} title="Personal Info" onClick={() => setCurrentTabIdx(SettingsTabs.PersonalInfo)} />
                <SidebarRow active={currentTabIdx === SettingsTabs.PersonalizeAccount} overrideOnClick={true} isShow={true} title="Peronalize Account" onClick={() => setCurrentTabIdx(SettingsTabs.PersonalizeAccount)} />
                <SidebarRow active={currentTabIdx === SettingsTabs.DeleteYourAccount} overrideOnClick={true} isShow={true} title="Delete Your Account" onClick={() => setCurrentTabIdx(SettingsTabs.DeleteYourAccount)} />
              </>
            )
            : (
              <>
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/explore.svg"
                        alt="Explore Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Explore"
                  href="/explore"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Explore);
                  }}
                  active={currentTab === SidebarTabs.Explore}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/notifications.svg"
                        alt="Notifications Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Notifications"
                  href="/notifications"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Notifications);
                  }}
                  active={currentTab === SidebarTabs.Notifications}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/messages.svg"
                        alt="Messages Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Messages"
                  href="/messages"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Messages);
                  }}
                  active={currentTab === SidebarTabs.Messages}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/bookmarks.svg"
                        alt="Bookmarks Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Bookmarks"
                  href="/bookmarks"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Bookmarks);
                  }}
                  active={currentTab === SidebarTabs.Bookmarks}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/lists.svg"
                        alt="Lists Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Lists"
                  href="/lists"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Lists);
                  }}
                  active={currentTab === SidebarTabs.Lists}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/community.svg"
                        alt="Community Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Communities"
                  href="/communities"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Communities);
                  }}
                  active={currentTab === SidebarTabs.Communities}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/zook.svg"
                        alt="Zook Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Marketplace"
                  overrideOnClick={true}
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Zook);
                    window.location.href = `${import.meta.env.VITE_PUBLIC_ZOOK_URL}`;
                  }}
                  active={currentTab === SidebarTabs.Zook}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/meetup.svg"
                        alt="Meetup Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Meetups"
                  overrideOnClick={true}
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Meetup);
                    window.location.href = `${import.meta.env.VITE_PUBLIC_MEETUP_URL}`;
                  }}
                  active={currentTab === SidebarTabs.Meetup}
                />
                <div className="relative more-container">
                  <SidebarRow
                    Icon={DotsCircleHorizontalIcon}
                    title="More"
                    onClick={handleDropdownEnter}
                  />
                  {isDropdownOpen && (
                    <div className="absolute left-0 bottom-[-10] mt-2 w-48 rounded-md shadow-lg ring-1 bg-white dark:bg-[#000000] ring-black ring-opacity-5 z-[800]">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                      >
                        {currentSessionUser ? (
                          <>
                            <SidebarRow
                              IconImage={
                                <>
                                  <img
                                    src="/icons/settings.svg"
                                    alt="Settings Icon"
                                    className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                                  />
                                </>
                              }
                              title="Settings"
                              isShow={true}
                              href="/settings"
                            />
                            <SidebarRow Icon={LoginIcon} title="Sign Out" />
                          </>
                        ) : (
                          <SidebarRow
                            Icon={LogoutIcon}
                            title="Sign In"
                            onClick={openModal}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <DarkSwitch />
                {profileInfo ? (
                  <UserProfileLink profileInfo={profileInfo} />
                ) : null}
              </>
            )}
        </>
      </div>
    </>
  );
};
export default observer(SideBar);
