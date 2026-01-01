/* eslint-disable react-hooks/exhaustive-deps */
import './App.css'
import { Outlet } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"

function App() {
	return (
		<div className='defaultLayout'>
			<Outlet />
            <Toaster />
		</div>
	)
}

export default App