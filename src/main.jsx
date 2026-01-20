import { Provider } from "@/components/ui/provider"
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { system } from './theme'
import './index.css'
import Layout from './Layout.jsx'
import NewHomeOwnerPage from './pages/newHomeOwners/NewHomeOwnerPage.jsx'
import Homepage from "./pages/Homepage.jsx"
import Services from './pages/Onboarding/Services.jsx'
import GetStarted from './pages/StyleMatch/GetStarted.jsx'
import Reccomendations from './pages/StyleMatch/Reccomendations.jsx'
import ExistingHomeOwner from './pages/ExistingHomeOwner/ExistingHomeOwner.jsx'
import ChatbotPage from "./pages/Chatbot/ChatbotPage"

createRoot(document.getElementById('root')).render(
  <Provider value={system}>
    	<BrowserRouter>
			<Routes>
				<Route path={"/"} element={<Layout />} >
					<Route index element={<Homepage />} />

					<Route path={"onboarding"}>
						<Route index element={<Services />} />
					</Route>

					<Route path={"newHomeOwner"}>
						<Route index element={<NewHomeOwnerPage />} />
					</Route>

					<Route path={"stylematch"}>
						<Route index element={<GetStarted />} />
						<Route path={"reccomendations"} element={<Reccomendations />} />
					</Route>

					<Route path={"existingHomeOwner"}>
						<Route index element={<ExistingHomeOwner />} />
					</Route>

					<Route path={"lumen"}>
						<Route index element={<ChatbotPage />} />
					</Route>
				</Route>
			</Routes>
		</BrowserRouter>
  </Provider>
)