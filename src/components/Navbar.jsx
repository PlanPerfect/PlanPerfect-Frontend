import { Flex, HStack, Spacer, useMediaQuery } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import LogoWithText from "./Navbar/LogoWithText";
import NavbarActions from "./Navbar/NavbarActions";
import Sidebar from "./Navbar/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useRecommendations } from "../contexts/RecommendationsContext";

const MotionFlex = motion.create(Flex);

function Navbar() {
	const location = useLocation();
	const isHome = location.pathname === "/";
	const isChatPage = location.pathname.startsWith("/lumen");
	const isRecommendationsPage = location.pathname === "/stylematch/reccomendations";
	const { hasRecommendations } = useRecommendations();
	const { user } = useAuth();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isWide] = useMediaQuery("(min-width: 530px)");
	const [isVisible] = useMediaQuery("(min-width: 325px)");

	if (!isVisible) return null;

	const showActions = (isHome && isWide) || isChatPage || (isRecommendationsPage && hasRecommendations);
	const showSidebarMenu = Boolean(user);
	const justify = showActions || showSidebarMenu ? "space-between" : "center";

	return (
		<MotionFlex
			as="nav"
			alignItems="center"
			justifyContent={justify}
			bg="rgba(0, 0, 0, 0.8)"
			rounded="17px"
			mb="20px"
			p="10px"
			overflow="visible"
			position="relative"
			visibility={isSidebarOpen ? "hidden" : "visible"}
			pointerEvents={isSidebarOpen ? "none" : "auto"}
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: isSidebarOpen ? 0 : 1, y: 0 }}
			transition={isSidebarOpen ? { duration: 0.2, ease: "easeOut" } : { duration: 0.8, ease: "easeOut", delay: 0.2 }}
			key={location.pathname}
			boxShadow="inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)"
			sx={{
				border: "1px solid transparent",
				borderImage: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1), rgba(0,0,0,0.3)) 1",
				borderRadius: "17px",
				background: "linear-gradient(145deg, #0a0a0a, #000000)",
				"&::before": {
					content: '""',
					position: "absolute",
					inset: "-1px",
					borderRadius: "17px",
					padding: "1px",
					background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.3) 100%)",
					WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
					WebkitMaskComposite: "xor",
					maskComposite: "exclude",
					pointerEvents: "none"
				}
			}}
		>
			<HStack gap={2}>
				{showSidebarMenu && <Sidebar onDrawerOpenChange={setIsSidebarOpen} />}
				<LogoWithText />
			</HStack>

			{showActions && (
				<>
					<Spacer />
					<NavbarActions />
				</>
			)}
		</MotionFlex>
	);
}

export default Navbar;
