import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
	Avatar,
	Box,
	Button,
	CloseButton,
	Dialog,
	Drawer,
	HStack,
	IconButton,
	Image,
	Portal,
	Text,
	VStack
} from "@chakra-ui/react";
import {
	LuSparkle,
	LuBriefcaseBusiness,
	LuHouse,
	LuLogOut,
	LuMenu,
	LuPalette
} from "react-icons/lu";
import { useAuth } from "../../contexts/AuthContext";
import LogoSVG from "../../assets/Logo.svg";
import TextPNG from "../../assets/Logo-Text.png";

const drawerItems = [
	{ label: "Home", path: "/", icon: LuHouse },
	{ label: "Services", path: "/onboarding", icon: LuBriefcaseBusiness },
	{ label: "StyleMatch", path: "/stylematch", icon: LuPalette },
	{ label: "AI Assistant", path: "/lumen/chat", icon: LuSparkle }
];

function Sidebar({ onDrawerOpenChange }) {
	const [open, setOpen] = useState(false);
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout } = useAuth();

	if (!user) return null;

	const userName = user.displayName || user.email?.split("@")[0] || "User";

	const isItemActive = path => {
		if (path === "/") return location.pathname === "/";
		if (path === "/lumen/chat") return location.pathname.startsWith("/lumen");
		return location.pathname === path || location.pathname.startsWith(`${path}/`);
	};

	const handleNavigate = path => {
		setOpen(false);
		onDrawerOpenChange?.(false);
		if (location.pathname !== path) {
			navigate(path);
		}
	};

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			sessionStorage.setItem("showLogoutToast", "1");
			await logout();
			setOpen(false);
			onDrawerOpenChange?.(false);
			setIsLogoutDialogOpen(false);
			navigate("/", { replace: true, state: { logoutSuccess: true } });
		} catch (error) {
			sessionStorage.removeItem("showLogoutToast");
			console.error("Error logging out:", error);
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<>
			<Drawer.Root
				placement="start"
				size="xs"
				open={open}
				onOpenChange={event => {
					setOpen(event.open);
					onDrawerOpenChange?.(event.open);
				}}
			>
			<Drawer.Trigger asChild>
				<IconButton
					aria-label="Open navigation menu"
					variant="ghost"
					size="sm"
					color="white"
					borderRadius="8px"
					_hover={{ bg: "rgba(255, 255, 255, 0.12)" }}
					ml={1}
				>
					<LuMenu />
				</IconButton>
			</Drawer.Trigger>

			<Portal>
				<Drawer.Backdrop />
				<Drawer.Positioner p={8} alignItems="center" justifyContent="flex-start">
					<Drawer.Content
						bg="#090909"
						color="white"
						border="1px solid rgba(255, 255, 255, 0.15)"
						borderRadius="20px"
						h="calc(100dvh - 64px)"
						maxH="calc(100dvh - 64px)"
					>
						<Drawer.Header justifyContent="center" pt={8} pb={6}>
							<Box display="inline-flex" alignItems="center" flexDirection="column">
								<Image src={LogoSVG} alt="PlanPerfect logo" boxSize="70px" objectFit="contain" mb={2} />
								<Image src={TextPNG} alt="PlanPerfect" h="20px" objectFit="contain" />
							</Box>
						</Drawer.Header>

						<Drawer.Body pt={1}>
							<VStack align="stretch" gap={2}>
								{drawerItems.map(item => {
									const ItemIcon = item.icon;
									return (
										<Button
											key={item.path}
											variant="ghost"
											borderRadius={15}
											justifyContent="flex-start"
											fontWeight={isItemActive(item.path) ? "700" : "500"}
											color={isItemActive(item.path) ? "#D4AF37" : "white"}
											bg={isItemActive(item.path) ? "rgba(212, 175, 55, 0.12)" : "transparent"}
											_hover={{ bg: "rgba(212, 175, 55, 0.2)" }}
											onClick={() => handleNavigate(item.path)}
										>
											<HStack gap={2.5}>
												<Box as={ItemIcon} boxSize="15px" flexShrink={0} />
												<Text>{item.label}</Text>
											</HStack>
										</Button>
									);
								})}
							</VStack>
						</Drawer.Body>

						<Drawer.Footer justifyContent="space-between" alignItems="center" borderTop="1px solid rgba(255, 255, 255, 0.15)" py={4}>
							<HStack gap={3}>
								<Avatar.Root size="sm">
									{user.photoURL && <Avatar.Image src={user.photoURL} alt={userName} />}
									<Avatar.Fallback name={userName} />
								</Avatar.Root>
								<Text fontSize="sm" fontWeight="600" maxW="110px" truncate>
									{userName}
								</Text>
							</HStack>

							<IconButton
								aria-label="Logout"
								size="sm"
								variant="ghost"
								color="red.400"
								borderRadius={10}
								_hover={{ bg: "rgba(245, 101, 101, 0.2)", color: "red.300" }}
								onClick={() => setIsLogoutDialogOpen(true)}
							>
								<LuLogOut />
							</IconButton>
						</Drawer.Footer>
					</Drawer.Content>
				</Drawer.Positioner>
			</Portal>
			</Drawer.Root>

			<Dialog.Root
				placement="center"
				motionPreset="scale"
				open={isLogoutDialogOpen}
				onOpenChange={event => {
					if (isLoggingOut) return;
					setIsLogoutDialogOpen(event.open);
				}}
			>
				<Portal>
					<Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(3px)" />
					<Dialog.Positioner>
						<Dialog.Content
							borderRadius="2xl"
							bg="rgba(18, 18, 18, 0.92)"
							backdropFilter="blur(10px)"
							border="1px solid rgba(255, 255, 255, 0.18)"
							p={5}
							maxW="420px"
							boxShadow="0 20px 50px rgba(0,0,0,0.45)"
						>
							<Dialog.CloseTrigger asChild>
								<CloseButton
									size="sm"
									position="absolute"
									top="12px"
									right="12px"
									color="white"
									disabled={isLoggingOut}
									_hover={{ background: "transparent" }}
								/>
							</Dialog.CloseTrigger>

							<VStack align="stretch" gap={4}>
								<Box>
									<Text color="white" fontSize="lg" fontWeight="700" mb={2}>
										Log out of PlanPerfect?
									</Text>
									<Text color="rgba(255,255,255,0.75)" fontSize="sm" lineHeight="1.6">
										You will need to sign in again to continue using your account.
									</Text>
								</Box>

								<HStack justify="flex-end" gap={2}>
									<Box
										as="button"
										onClick={() => setIsLogoutDialogOpen(false)}
										disabled={isLoggingOut}
										px={4}
										py={2}
										borderRadius="lg"
										border="1px solid rgba(255,255,255,0.25)"
										bg="rgba(255,255,255,0.08)"
										color="white"
										fontSize="sm"
										fontWeight="600"
										cursor={isLoggingOut ? "not-allowed" : "pointer"}
										opacity={isLoggingOut ? 0.5 : 1}
										_hover={isLoggingOut ? {} : { bg: "rgba(255,255,255,0.14)" }}
									>
										Cancel
									</Box>

									<Box
										as="button"
										onClick={handleLogout}
										disabled={isLoggingOut}
										px={4}
										py={2}
										borderRadius="lg"
										border="1px solid rgba(255, 140, 140, 0.55)"
										bg="rgba(255, 90, 90, 0.2)"
										color="white"
										fontSize="sm"
										fontWeight="700"
										cursor={isLoggingOut ? "not-allowed" : "pointer"}
										opacity={isLoggingOut ? 0.65 : 1}
										_hover={isLoggingOut ? {} : { bg: "rgba(255, 90, 90, 0.3)" }}
									>
										{isLoggingOut ? "Logging out..." : "Log out"}
									</Box>
								</HStack>
							</VStack>
						</Dialog.Content>
					</Dialog.Positioner>
				</Portal>
			</Dialog.Root>
		</>
	);
}

export default Sidebar;
