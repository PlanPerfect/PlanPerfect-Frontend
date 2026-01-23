import { Box } from '@chakra-ui/react'
import LandingBackground from '../assets/LandingBackground.png'
import ShowToast from '@/Extensions/ShowToast'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function NotFound() {
    const navigate = useNavigate();

    useEffect(() => {
        ShowToast("info", "Sorry, but we couldn't find the page you're looking for.", "", {
            persistent: true,
            action: {
                label: "Go to Home",
                onClick: () => navigate("/")
            }
        })
    }, [])

    return (
        <>
            <Box style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${LandingBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: -1
            }} />
        </>
    )
}

export default NotFound