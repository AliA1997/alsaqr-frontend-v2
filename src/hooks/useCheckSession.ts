import { useEffect } from "react";
import { supabase } from "@utils/supabase";
import { userApiClient } from "@utils/userApiClient";
import { User } from "typings";
import { useLocation } from "react-router";
import { testAuthUser } from "@utils/testData";
import { inTestMode } from "@utils/constants";

export function useCheckSession(setState: Function, sessionUser: User | undefined | null, resetAuthState: () => void) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!inTestMode() && sessionUser?.email === testAuthUser.email)
      resetAuthState();

    if (!inTestMode())
      supabase.auth.getSession()
        .then(async sessionInfo => {
          if (sessionInfo && sessionInfo.data.session) {
            await userApiClient.sessionSignin(sessionInfo.data.session.user.email!);
            const checkData = await userApiClient.sessionCheck(sessionInfo.data.session.user.email!);

            if (checkData)
              setState(checkData.result);
          } else {
            setState(undefined);
          }
        })
  }, [sessionUser?.id, pathname]);

  return {};
}