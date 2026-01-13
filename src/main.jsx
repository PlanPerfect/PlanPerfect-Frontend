import { Provider } from "@/components/ui/provider"
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout.jsx'
import Sample from './pages/Sample.jsx'
import ExistingHomeOwner from './pages/ExistingHomeOwner/existingHomeOwner.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <Provider>
    	<BrowserRouter>
			<Routes>
				<Route path={"/"} element={<Layout />} >
					<Route index element={<Sample />} />
					<Route path={"existingOwner"} element={<ExistingHomeOwner />} />
				</Route>
			</Routes>
		</BrowserRouter>
  </Provider>,
)