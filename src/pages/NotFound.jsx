import { Box } from '@chakra-ui/react'
import LandingBackground from '../assets/LandingBackground.png'
import ShowToast from '@/Extensions/ShowToast'
import { useEffect } from 'react'

function NotFound() {
    useEffect(() => {
        ShowToast("error", "404 Not Found", "The page you are looking for does not exist.")
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