/* eslint-disable react-hooks/exhaustive-deps */
import './App.css'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import Navbar from './components/Navbar'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppLayout() {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!loading && !user && location.pathname !== "/") {
		return <Navigate to="/" replace state={{ from: location.pathname }} />;
	}

	if (!loading) return (
		<div className='defaultLayout'>
			<Toaster />
			<Navbar />
			<Outlet />
		</div>
	);
}

function App() {
	return (
		<AuthProvider>
			<AppLayout />
		</AuthProvider>
	)
}

export default App;