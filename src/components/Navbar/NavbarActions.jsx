import { useNavigate, useLocation } from "react-router-dom";
import { CloseButton, Dialog, Portal, Button, Text, Heading, VStack, Box } from "@chakra-ui/react";

function NavbarActions() {
	const navigate = useNavigate();
	const location = useLocation();

	if (location.pathname !== "/") return null;

	return (
		<Dialog.Root placement={"center"} motionPreset="slide-in-bottom">
			<Dialog.Trigger asChild>
				<Button bg="transparent" border="2px solid #D4AF37" borderRadius="8px" fontWeight="500" fontSize="sm" px={3} _hover={{ bg: "rgba(212, 197, 160, 0.1)" }} _active={{ bg: "rgba(212, 197, 160, 0.2)" }}>
					<Text color="white" fontWeight="bold">
						GET STARTED
					</Text>
				</Button>
			</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
				<Dialog.Positioner>
					<Dialog.Content borderRadius={20} bg="whiteAlpha.900" backdropFilter="blur(10px)" border="2px solid" borderColor="transparent" p={8} maxW="400px" boxShadow="0 20px 60px rgba(0, 0, 0, 0.3)">
						<Dialog.CloseTrigger asChild position="absolute" top="16px" right="16px" zIndex={10}>
							<CloseButton size="sm" />
						</Dialog.CloseTrigger>

						<VStack spacing={6} align="center" py={4}>
							<Box textAlign="center">
								<Heading size="xl" color="gray.800" mb={2}>
									Sign in to PlanPerfect
								</Heading>
							</Box>

							<Box width="100%">
								<button
									className="gsi-material-button"
									style={{
										height: "52px",
										borderRadius: "12px",
										border: "2px solid #e8e8e8",
										backgroundColor: "white",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										padding: "0",
										position: "relative",
										overflow: "hidden",
										boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
										transition: "all 0.3s ease",
										width: "100%"
									}}
									onMouseEnter={e => {
										e.currentTarget.style.transform = "translateY(-2px)";
										e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
										e.currentTarget.style.borderColor = "#d4d4d4";
									}}
									onMouseLeave={e => {
										e.currentTarget.style.transform = "translateY(0)";
										e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
										e.currentTarget.style.borderColor = "#e8e8e8";
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											width: "100%",
											height: "100%",
											padding: "0 20px",
											gap: "16px",
											justifyContent: "center"
										}}
									>
										<Box position="relative" display="flex" alignItems="center" justifyContent="center">
											<Box position="absolute" width="40px" height="40px" bg="blue.500" opacity={0.15} filter="blur(12px)" borderRadius="full" />
											<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: "24px", height: "24px", position: "relative", zIndex: 1 }}>
												<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
												<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
												<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
												<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
												<path fill="none" d="M0 0h48v48H0z"></path>
											</svg>
										</Box>
										<span
											style={{
												fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
												fontSize: "16px",
												fontWeight: "600",
												color: "#3c4043",
												letterSpacing: "0.25px"
											}}
										>
											Continue with Google
										</span>
									</div>
								</button>
							</Box>

							<Text fontSize="xs" color="gray.500" textAlign="center" px={4}>
								Secure authentication provided by Google
							</Text>
						</VStack>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}

export default NavbarActions;
