import { useLayoutEffect } from "react";
import { supabase } from "@utils/supabase";
import { userApiClient } from "@utils/userApiClient";
import { User } from "typings";
import { useLocation } from "react-router";

export function useCheckSession(setState: Function, sessionUser: User | undefined | null) {
  const { pathname } = useLocation();
  async function getSetSession() {
    const sessionInfo = await supabase.auth.getSession();
    if (sessionInfo && sessionInfo.data.session) {
      await userApiClient.sessionSignin(sessionInfo.data.session.user.email!);
      const checkData = await userApiClient.sessionCheck(sessionInfo.data.session.user.email!);

      console.log("JSON.stringify", JSON.stringify(checkData))
      console.log("JSON.parse", JSON.parse(checkData))
      console.log("checkData.data", checkData.data)
      console.log("checkData.result", checkData.result)

      console.log("JSON.parse", JSON.parse(checkData.data))
      
      setState(checkData.result);
    } else {
      setState(undefined);
    }
  }

  useLayoutEffect(() => {
    getSetSession();
  }, [sessionUser?.id, pathname]);

  return {};
}