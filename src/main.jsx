import { Provider } from "@/components/ui/provider"
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout.jsx'
import Homepage from "./pages/Homepage.jsx"
import Services from './pages/Onboarding/Services.jsx'
import GetStarted from './pages/StyleMatch/GetStarted.jsx'
import Reccomendations from './pages/StyleMatch/Reccomendations.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <Provider>
    	<BrowserRouter>
			<Routes>
				<Route path={"/"} element={<Layout />} >
					<Route index element={<Homepage />} />
					<Route path={"onboarding"}>
						<Route index element={<Services />} />
					</Route>

					<Route path={"stylematch"}>
						<Route index element={<GetStarted />} />
						<Route path={"reccomendations"} element={<Reccomendations />} />
					</Route>
				</Route>
			</Routes>
		</BrowserRouter>
  </Provider>
)