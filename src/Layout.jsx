/* eslint-disable react-hooks/exhaustive-deps */
import './App.css'
import { Outlet } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import Navbar from './components/Navbar'

function App() {
	return (
		<div className='defaultLayout'>
			<Navbar />
			<Outlet />
            <Toaster />
		</div>
	)
}

export default App