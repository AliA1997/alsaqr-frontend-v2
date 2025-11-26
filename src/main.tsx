import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './router/index.tsx'
import './index.css'
import { store } from '@stores/index.ts'
import { ThemeProvider } from './ThemeProvider.tsx'
import { supabase } from '@utils/supabase.ts'
import { userApiClient } from '@utils/userApiClient.ts'

store.authStore.initializeFromStorage().then(() => console.log("Welcome to alsaqr"));
supabase.auth.getSession()
  .then(async sessionInfo => {
    if (sessionInfo && sessionInfo.data.session) {
      store.authStore.setProcessingUserCheck(true);
      await userApiClient.sessionSignin(sessionInfo.data.session.user.email!);
      const checkData = await userApiClient.sessionCheck(sessionInfo.data.session.user.email!);

      if (checkData) {
        store.authStore.setCurrentSessionUser(checkData.result);
        if(store.authStore.auth) store.authStore.auth?.setUser(checkData.result);
      }
    } else {
      store.authStore.resetAuthState();
    }
  })
  .finally(() => store.authStore.setProcessingUserCheck(false));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <RouterProvider router={router} /> 
    </ThemeProvider>
  </StrictMode>,
)
