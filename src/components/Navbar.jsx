import { Flex, Spacer } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import LogoWithText from "./Navbar/LogoWithText";
import NavbarActions from "./Navbar/NavbarActions";

const MotionFlex = motion.create(Flex);

function Navbar() {
	const location = useLocation();
	const isHome = location.pathname === "/";

	return (
		<MotionFlex
			as="nav"
			alignItems="center"
			justifyContent={isHome ? "space-between" : "center"}
			bg="rgba(0, 0, 0, 0.5)"
			rounded="17px"
			mb="20px"
			p="10px"
			overflow="hidden"
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
			key={location.pathname}
		>
			<LogoWithText />

			{isHome && (
				<>
					<Spacer />
					<NavbarActions />
				</>
			)}
		</MotionFlex>
	);
}

export default Navbar;