import { Flex, Spacer, useMediaQuery } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import LogoWithText from "./Navbar/LogoWithText";
import NavbarActions from "./Navbar/NavbarActions";

const MotionFlex = motion.create(Flex);

function Navbar() {
	const location = useLocation();
	const isHome = location.pathname === "/";
	const [isWide] = useMediaQuery("(min-width: 530px)");
	const [isVisible] = useMediaQuery("(min-width: 325px)");

	if (!isVisible) return null;

	const justify = isHome && isWide ? "space-between" : "center";

	return (
		<MotionFlex
			as="nav"
			alignItems="center"
			justifyContent={justify}
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

			{isHome && isWide && (
				<>
					<Spacer />
					<NavbarActions />
				</>
			)}
		</MotionFlex>
	);
}

export default Navbar;