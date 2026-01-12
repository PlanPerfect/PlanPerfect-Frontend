import { Box, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import LogoSVG from "../../assets/Logo.svg";
import TextPNG from "../../assets/Logo-Text.png";

function LogoWithText() {
	const navigate = useNavigate();

	const handleLogoClick = () => navigate("/");

	return (
		<Box as="button" onClick={handleLogoClick} cursor="pointer" ml="10px" display="inline-flex" alignItems="center" w="auto" p="2">
			<Image
				src={LogoSVG}
				alt="logo"
				objectFit="contain"
				boxSize={{ base: "20px", sm: "24px", md: "28px" }}
				transition="all 0.2s ease"
			/>
			<Image
				src={TextPNG}
				alt="brand"
				objectFit="contain"
				ml={3}
				height={{ base: "18px", sm: "20px", md: "24px" }}
				transition="all 0.2s ease"
			/>
		</Box>
	);
}

export default LogoWithText;