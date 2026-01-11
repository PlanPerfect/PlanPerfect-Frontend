import { Provider } from "@/components/ui/provider"
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GetStarted from './pages/stylematch/GetStarted.jsx'
import Layout from './Layout.jsx'
import Homepage from "./pages/Homepage.jsx"
import './index.css'

createRoot(document.getElementById('root')).render(
  <Provider>
    	<BrowserRouter>
			<Routes>
				<Route path={"/"} element={<Layout />} >
					<Route index element={<Homepage />} />

					<Route path={"stylematch"}>
						<Route index element={<GetStarted />} />
					</Route>
				</Route>
			</Routes>
		</BrowserRouter>
  </Provider>
)