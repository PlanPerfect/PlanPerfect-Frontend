import { useLocation, useNavigate } from "react-router-dom";
import { Button, Text, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import AuthDialog from "../Homepage/AuthDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useRecommendations } from "../../contexts/RecommendationsContext";

const MotionBox = motion.create(Box);

function NavbarActions() {
	const location = useLocation();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { hasRecommendations } = useRecommendations();

	if (location.pathname === "/stylematch/reccomendations" && hasRecommendations) {
		return (
			<MotionBox
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
			>
				<Button
					bg="transparent"
					border="2px solid #D4AF37"
					borderRadius="8px"
					fontWeight="500"
					fontSize="sm"
					px={3}
					_hover={{ bg: "rgba(212, 197, 160, 0.1)" }}
					_active={{ bg: "rgba(212, 197, 160, 0.2)" }}
					onClick={() => navigate("/imagegeneration")}
				>
					<Text color="white" fontWeight="bold">
						GENERATE IMAGE
					</Text>
				</Button>
			</MotionBox>
		);
	}

	if (location.pathname === "/lumen/chat") {
		return (
			<Button
				bg="transparent"
				border="2px solid #D4AF37"
				borderRadius="8px"
				fontWeight="500"
				fontSize="sm"
				px={3}
				_hover={{ bg: "rgba(212, 197, 160, 0.1)" }}
				_active={{ bg: "rgba(212, 197, 160, 0.2)" }}
				onClick={() => navigate("/designdocument")}
			>
				<Text color="white" fontWeight="bold">
					GENERATE DOCUMENT
				</Text>
			</Button>
		);
	}

	if (location.pathname !== "/") return null;

	const buttonElement = (
		<Button
			bg="transparent"
			border="2px solid #D4AF37"
			borderRadius="8px"
			fontWeight="500"
			fontSize="sm"
			px={3}
			_hover={{ bg: "rgba(212, 197, 160, 0.1)" }}
			_active={{ bg: "rgba(212, 197, 160, 0.2)" }}
			onClick={user ? () => navigate("/onboarding") : undefined}
		>
			<Text color="white" fontWeight="bold">
				GET STARTED
			</Text>
		</Button>
	);

	if (user) {
		return buttonElement;
	}

	return <AuthDialog trigger={buttonElement} size="xs" />;
}

export default NavbarActions;