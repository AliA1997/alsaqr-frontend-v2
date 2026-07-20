import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router/index.tsx'
import { store } from '@stores/index.ts'
import { ThemeProvider } from './ThemeProvider.tsx'
import { supabase } from '@utils/infrastructure/supabase.ts'
import { wagmiConfig } from '@utils/infrastructure/wagmi.ts'
import { userApiClient } from '@utils/api/userApiClient.ts'
import { prefetchUserData } from '@utils/workerFunctions/prefetchUserData.ts'
import { prefetchWidgetData } from '@utils/workerFunctions/prefetchWidgetData.ts'
import ErrorBoundary from '@common/ErrorBoundary.tsx'
import './index.css'
import Auth from '@utils/auth.ts'

const queryClient = new QueryClient()

store.authStore.initializeFromStorage()
  .then(() => console.log("Welcome to alsaqr"));

// Prefetch news from all explore sources for the homepage widget
prefetchWidgetData();

supabase.auth.getSession()
  .then(async sessionInfo => {
    if (sessionInfo && sessionInfo.data.session) {
      store.authStore.setProcessingUserCheck(true);

      const { accessToken } = await userApiClient.sessionSignin(sessionInfo.data.session.user);
      const checkData = await userApiClient.sessionCheck(sessionInfo.data.session.user.email!);
      
      if (checkData && accessToken) {
        store.authStore.setToken(accessToken);
        store.authStore.setCurrentSessionUser(checkData.result);
        setTimeout(() => prefetchUserData(checkData.result.id, accessToken!), 5000);
      }
    } else {
      // No supabase session. That is normal for web3 wallet sessions, so the
      // persisted user is the source of truth here — only treat the user as
      // logged out when there is no persisted user at all.
      const auth = new Auth();
      const persistedUser = auth?.getUser();
      const persistedAccessToken = auth?.getToken();
      console.log('persistedAccessToken', persistedAccessToken);
      if (persistedUser?.id && persistedAccessToken) {
        store.authStore.setCurrentSessionUser(persistedUser);
        store.authStore.setToken(persistedAccessToken);
        if (persistedUser.web3_address || persistedUser.web3Address)
          store.authStore.setWeb3Address(persistedUser.web3_address ?? persistedUser.web3Address);
        setTimeout(() => prefetchUserData(persistedUser.id, persistedAccessToken ?? ""), 5000);
      } else {
        store.authStore.resetAuthState();
      }
    }
  })
  .finally(() => store.authStore.setProcessingUserCheck(false));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Outermost net: catches failures in the providers and the layout shell,
        which the route-level boundary in App sits inside of. */}
    <ErrorBoundary title="AlSaqr failed to load">
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </StrictMode>,
)
