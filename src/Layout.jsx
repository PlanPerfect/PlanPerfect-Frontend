/* eslint-disable react-hooks/exhaustive-deps */
import './App.css'
import { Outlet } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import Navbar from './components/Navbar'
import { AuthProvider } from './contexts/AuthContext'

function App() {
	return (
		<>
			<div className='defaultLayout'>
				<AuthProvider>
					<Navbar />
					<Outlet />
					<Toaster />
				</AuthProvider>
			</div>
		</>
	)
}

export default App