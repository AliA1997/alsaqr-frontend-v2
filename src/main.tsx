import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './router/index.tsx'
import './index.css'
import { store } from '@stores/index.ts'
import { ThemeProvider } from './ThemeProvider.tsx'

store.authStore.initializeFromStorage().then(() => console.log("Welcome to alsaqr"));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <RouterProvider router={router} /> 
    </ThemeProvider>
  </StrictMode>,
)
