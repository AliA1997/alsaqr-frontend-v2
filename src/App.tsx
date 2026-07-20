import { Outlet, useLocation } from 'react-router';
import './App.css'
import Layout from './Layout';
import ErrorBoundary from '@common/ErrorBoundary';


function App() {
  const { pathname } = useLocation();

  return (
    <Layout>
      {/* Keyed on the route so a crashed page recovers when the user navigates
          away, and so the sidebar/footer stay usable while it is showing. */}
      <ErrorBoundary resetKey={pathname}>
        <Outlet />
      </ErrorBoundary>
    </Layout>
  )
}

export default App
