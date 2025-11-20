import { getEmailUsername, stopPropagationOnClick } from "@utils/index";
import { OptimizedImage } from "./Image";
import { User } from "typings";
import { useNavigate } from "react-router";

export interface CommonLinkProps {
  animatedLink: boolean;
  onClick: Function;
  activeInd?: boolean;
  classNames?: string;
  testId?: string;
}

export interface UserProfileLinkProps {
  profileInfo: User | null;
}

export function CommonLink(props: React.PropsWithChildren<CommonLinkProps>) {
  return (
    <div
      onClick={(e) => stopPropagationOnClick(e, props.onClick)}
      className={`
        ${
          props.animatedLink
            ? `group flex md:max-w-fit w-100 md:w-unset 
      cursor-pointer items-center space-x-2 px-4 py-3  dark:text-gray-50
      transition-all duration-200 animate-pulse text-[#55a8c2] hover:bg-[#55a8c2]-100 dark:hover:bg-[#000000] dark:hover:opacity-50 dark:text-[#55a8c2]`
            : `group flex max-w-fit 
            justify-center
      cursor-pointer items-center space-x-2 rounded-full px-4 py-3 dark:text-gray-50
      transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600`
        }
        ${props.activeInd ? "bg-gray-100 dark:bg-gray-600 text-[#55a8c2]" : ""}
        ${props.classNames ?? ""}
        `}
        data-testid={props.testId ?? ""}
    >
      {props.children}
    </div>
  );
}

export function UserProfileLink({ profileInfo }: React.PropsWithChildren<UserProfileLinkProps>) {
  const navigate = useNavigate();
  return (
    <>
      <hr />
      {/* <div className="flex align-center p-2 cursor-pointer hover:opacity-75"> */}
      <div
        data-testid="loggedinuserbutton"
        onClick={() => navigate(`/users/${profileInfo?.username}`)}
        className={`
            group flex max-w-fit
            cursor-pointer items-center space-x-2 rounded-full px-1 md:px-4 py-1 py-3
            transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 mb-1 mt-1 
          `}
      >
        <OptimizedImage
          classNames="m-0 mt-3 w-full h-8 md:h-14 md:w-14 rounded-full"
          src={profileInfo?.avatar ?? ''}
          alt="Avatar"
        />
        {/* <div className="flex flex-col justify-center  p-3 opacity-50 text-xs sm:text-sm lg:text-md"> */}
        <div className={`
            flex flex-col display-none md:display-initial hidden 
            group-hover:text-[#55a8c2] dark:text-gray-50
            md:inline-flex text-base font-light text-xs lg:text-sm
          `}>
          <p>{profileInfo?.username}</p>
          <p className="ml-2">@{getEmailUsername(profileInfo?.username!)}</p>
        </div>
      </div>
    </>
  );
}