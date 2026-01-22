import { Box, Button, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import AuthDialog from "../Homepage/AuthDialog";
import { useAuth } from "../../contexts/AuthContext";

function GetStartedButton({ width = "auto", destination, delay = "2.2s", loading, auth }) {
	const navigate = useNavigate();
	const { user } = useAuth();

	const buttonContent = (
		<Box width={width} opacity={0} animation={`fadeInUp 0.8s ease-out ${delay} forwards`}>
			<Button
				width="100%"
				background="linear-gradient(to right, #F4E5B2, #D4AF37, #F4E5B2)"
				backgroundSize="200% 100%"
				backgroundPosition="left"
				color="white"
				fontWeight="bold"
				px={12}
				py={7}
				fontSize="md"
				borderRadius={20}
				fontFamily="'Montserrat', sans-serif"
				textTransform="uppercase"
				isLoading={loading}
				isDisabled={loading}
				cursor={loading ? "not-allowed" : "pointer"}
				_hover={loading ? {} : { backgroundPosition: "right" }}
				_active={loading ? { transform: "none" } : {}}
				transition="background-position 0.3s ease-in-out"
				onClick={!auth && !loading && destination ? () => navigate(destination) : undefined}
			>
				<Text>Get Started</Text>
			</Button>
		</Box>
	);

	if (auth && user) {
		return (
			<Box width={width} opacity={0} animation={`fadeInUp 0.8s ease-out ${delay} forwards`}>
				<Button
					width="100%"
					background="linear-gradient(to right, #F4E5B2, #D4AF37, #F4E5B2)"
					backgroundSize="200% 100%"
					backgroundPosition="left"
					color="white"
					fontWeight="bold"
					px={12}
					py={7}
					fontSize="md"
					borderRadius={20}
					fontFamily="'Montserrat', sans-serif"
					textTransform="uppercase"
					_hover={{ backgroundPosition: "right" }}
					transition="background-position 0.3s ease-in-out"
					onClick={() => navigate("/onboarding")}
				>
					<Text>Get Started</Text>
				</Button>
			</Box>
		);
	}

	return auth ? <AuthDialog trigger={buttonContent} size="xs" /> : buttonContent;
}

export default GetStartedButton;