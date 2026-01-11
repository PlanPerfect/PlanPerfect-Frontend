import { Box, Image } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import LogoSVG from "../../assets/Logo.svg"
import TextPNG from '../../assets/Logo-Text.png'

function LogoWithText() {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <Box
            as="button"
            onClick={handleLogoClick}
            cursor="pointer"
            ml="10px"
            display="inline-flex"
            alignItems="center"
            w="auto"
            p="2"
        >
            <Image src={LogoSVG} boxSize="28px" objectFit="contain" alt="logo" />
            <Image src={TextPNG} height="24px" ml={3} objectFit="contain" alt="brand" />
        </Box>
    )
}

export default LogoWithText