import { useLayoutEffect } from "react";
import { supabase } from "@utils/supabase";
import { userApiClient } from "@utils/userApiClient";
import { User } from "typings";

export function useCheckSession( setState: Function, sessionUser: User | undefined | null) {
  
 async function getSetSession() {
    const sessionInfo = await supabase.auth.getSession();
    if (sessionInfo && sessionInfo.data.session) {
      await userApiClient.sessionSignin(sessionInfo.data.session.user.email!);
      const { result:userSession } = await userApiClient.sessionCheck(sessionInfo.data.session.user.email!);
      
      setState(userSession);
    } else {
      setState(undefined);
    }
 }

  useLayoutEffect(() => {
    getSetSession();
  }, [sessionUser?.id]);

    return {};
}