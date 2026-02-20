import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, VStack } from "@chakra-ui/react";
import LandingBackground from "../assets/LandingBackground.png";
import GetStartedButton from "@/components/Homepage/GetStartedButton";
import AnimatedLogo from "@/components/Homepage/AnimatedLogo";
import AnimatedHeading from "@/components/Homepage/AnimatedHeading";
import ShowToast from "@/Extensions/ShowToast";

function Homepage() {
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		const hasLogoutToast = sessionStorage.getItem("showLogoutToast") === "1" || Boolean(location.state?.logoutSuccess);

		if (hasLogoutToast) {
			ShowToast("success", "Logged out", "You have been signed out successfully.");
			sessionStorage.removeItem("showLogoutToast");
		}

		if (location.state?.authRedirect && !hasLogoutToast) {
			ShowToast("warning", "You're signed out", "Please login first.");
		}

		if (location.state?.authRedirect || location.state?.logoutSuccess) {
			navigate(location.pathname, { replace: true, state: {} });
		}
	}, [location.state, navigate, location.pathname]);

	return (
		<>
			<Box
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: `url(${LandingBackground})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					zIndex: -1
				}}
			/>

			<VStack position="relative" justify="center" align="center" height="70vh" gap={8}>
				<AnimatedLogo />

				<AnimatedHeading />

				<GetStartedButton delay={"1.4s"} auth={true} />
			</VStack>

			<style>
				{`
                    @keyframes fadeInDown {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
			</style>
		</>
	);
}

export default Homepage;
