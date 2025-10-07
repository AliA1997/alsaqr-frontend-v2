import { useState } from 'react'
import { Outlet } from 'react-router';
import './App.css'
import Layout from './Layout';


function App() {
  const [count, setCount] = useState(0)

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default App
