import { useLocation } from "react-router-dom";
import { Button, Text } from "@chakra-ui/react";
import AuthDialog from "../Homepage/AuthDialog"

function NavbarActions() {
	const location = useLocation();

	if (location.pathname !== "/") return null;

	const trigger = (
		<Button
			bg="transparent"
			border="2px solid #D4AF37"
			borderRadius="8px"
			fontWeight="500"
			fontSize="sm"
			px={3}
			_hover={{ bg: "rgba(212, 197, 160, 0.1)" }}
			_active={{ bg: "rgba(212, 197, 160, 0.2)" }}
		>
			<Text color="white" fontWeight="bold">
				GET STARTED
			</Text>
		</Button>
	);

	return <AuthDialog trigger={trigger} size="xs" />;
}

export default NavbarActions;
