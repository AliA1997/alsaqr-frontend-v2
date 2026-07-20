import { useEffect, useRef } from "react";
import Auth from "@utils/auth";
import { User } from "typings";
import { useLocation } from "react-router";
import agent from "@utils/api/agent";
import { supabase } from "@utils/infrastructure/supabase";

// At most one session round-trip per this window, however many times the user
// navigates inside it.
const SESSION_CHECK_COOLDOWN_MS = 5000;

export function useCheckSession(
  authStorage: Auth | undefined,
  setState: Function, 
  resetAuthState: () => void,
  sessionUser: User | undefined | null,
  openCompleteRegistrationModal: (userInfo: {[key: string]: any }) => void,
  completeRegistrationModalShown: boolean
) {
  const retryRegisterCheckCount = useRef(0);
  // Leading-edge debounce state. This has to live in a ref: a local inside the
  // debounce helper is re-created as null on every call, so its `if (!timeoutId)`
  // gate always passes and the "debounce" fires every single time.
  const lastCheckedAt = useRef(0);
  const { pathname } = useLocation();
  
  async function getSetSession() {

    const sessionInfo = sessionUser ?? authStorage?.getUser() ?? (await supabase.auth.getSession())?.data?.session?.user;

    if (!sessionInfo) {
      authStorage!.clearToken();
      resetAuthState();
      retryRegisterCheckCount.current = 0;
      return;
    }

    try {
      // The jwt cookie is the authoritative source for the bearer token attached
      // by the axios request interceptor; keep it in sync with the live session.
      const res = await agent.userApiClient.sessionSignin({ email: sessionInfo.email!, web3_address: (sessionInfo as any)["web3_address"] ?? (sessionInfo as any)["web3Address"] });
      authStorage!.setToken(res.accessToken);
      const checkData = await agent.userApiClient.sessionCheck(sessionInfo.email!,  (sessionInfo as any)["web3_address"] ?? (sessionInfo as any)["web3Address"]);

      if(checkData?.result) {
        setState(checkData.result);

        if(!checkData.result.isCompleted && !completeRegistrationModalShown && retryRegisterCheckCount.current < 3) {
          openCompleteRegistrationModal(checkData.result);
          retryRegisterCheckCount.current++;
        }
      }
    } catch (error) {
      // A failed refresh is not proof the user is logged out (offline, 500,
      // rate limit). Keep the persisted session rather than signing them out.
      console.log("ERROR:", error);
    }
  }

  useEffect(() => {
    if (!authStorage) return;

    // Leading edge: run the first call immediately, then swallow every call
    // that lands inside the cooldown. Stamping the ref before the await also
    // keeps two navigations in the same tick from both firing.
    const now = Date.now();
    if (now - lastCheckedAt.current < SESSION_CHECK_COOLDOWN_MS) return;
    lastCheckedAt.current = now;

    void getSetSession();
  }, [sessionUser?.id, pathname]);


  return {};
}