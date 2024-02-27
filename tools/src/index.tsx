import { createRoot } from 'react-dom/client'
import { UIProvider, Button } from '@yamada-ui/react'

const App = () => {
  return (
    <UIProvider>
      <Button colorScheme='primary' variant='solid'>Hello</Button>
    </UIProvider>
  )
}

const root = createRoot(document.getElementById("app") as HTMLElement)
root.render(<App />)
