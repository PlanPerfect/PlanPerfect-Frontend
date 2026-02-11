import './App.css'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import Navbar from './components/Navbar'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { RecommendationsProvider } from './contexts/RecommendationsContext'

function AppLayout() {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) return null;

	if (!user && location.pathname !== "/") {
		return <Navigate to="/" replace state={{ from: location.pathname, authRedirect: true }} />;
	}

	return (
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
			<RecommendationsProvider>
				<AppLayout />
			</RecommendationsProvider>
		</AuthProvider>
	)
}

export default App;