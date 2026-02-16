'use client'

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
  max: 3,
})

const getToastStyles = (type) => {
  const baseStyles = {
    borderRadius: 'xl',
  }

  switch (type) {
    case 'success':
      return {
        ...baseStyles,
        bg: '#3E2C1E',
        color: 'white',
      }
    case 'error':
      return {
        ...baseStyles,
        bg: 'red.solid',
        color: 'white',
      }
    case 'info':
    default:
      return {
        ...baseStyles,
        bg: 'white',
        color: 'black',
      }
  }
}

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
        {(toast) => (
          <Toast.Root
            width={{ md: 'sm' }}
            {...getToastStyles(toast.type)}
          >
            {toast.type === 'loading' ? (
              <Spinner size='sm' color='blue.solid' />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap='1' flex='1' maxWidth='100%'>
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
