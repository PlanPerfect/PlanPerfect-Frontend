import { Flex, Spacer } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'
import LogoWithText from './Navbar/LogoWithText'
import NavbarActions from './Navbar/NavbarActions'

function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === "/"

  return (
    <>
      <style>
        {`
          @keyframes fadeInDown {
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
        justifyContent={isHome ? "space-between" : "center"}
        bg="rgba(0, 0, 0, 0.5)"
        rounded="17px"
        mb="20px"
        p="10px"
        overflow="hidden"
        opacity={0}
        animation="fadeInDown 0.8s ease-out 0.2s forwards"
      >
        <LogoWithText />

        {isHome && (
          <>
            <Spacer />
            <NavbarActions />
          </>
        )}
      </Flex>
    </>
  )
}

export default Navbar