import { Flex, Spacer } from '@chakra-ui/react'
import LogoWithText from './Navbar/LogoWithText'
import NavbarActions from './Navbar/NavbarActions'

function Navbar() {
    return (
        <>
            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>

            <Flex
                as="nav"
                alignItems="center"
                bg="rgba(0, 0, 0, 0.5)"
                rounded="17px"
                mb="20px"
                p="10px"
                overflow="hidden"
                opacity={0}
                animation="fadeInDown 0.8s ease-out 0.2s forwards"
            >
                <LogoWithText />

                <Spacer />

                <NavbarActions />
            </Flex>
        </>
    )
}

export default Navbar