/* eslint-disable react-hooks/exhaustive-deps */
import './App.css'
import { Outlet } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import Navbar from './components/Navbar'

function App() {
	return (
		<>
			<div className='defaultLayout'>
				<Navbar />
				<Outlet />
				<Toaster />
			</div>

			<style>
                {`
                    @keyframes fadeInDown {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>
		</>
	)
}

export default App