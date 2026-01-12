import { Provider } from "@/components/ui/provider"
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout.jsx'
import Sample from './pages/Sample.jsx'
import NewHomeOwnerPage from './pages/newHomeOwners/NewHomeOwnerPage.jsx'
import './index.css'
import { system } from './theme'

createRoot(document.getElementById('root')).render(
  <Provider value={system}>
    	<BrowserRouter>
			<Routes>
				<Route path={"/"} element={<Layout />} >
					<Route index element={<Sample />} />
					<Route path={"newHomeOwner"} element={<NewHomeOwnerPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
  </Provider>,
)