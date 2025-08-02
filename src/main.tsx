/*
   _   _ ____ _  _    ____ ____ ___    _  _ ____   /
    \_/  |  | |  |    | __ |  |  |     |\/| |___  / 
...  |   |__| |__|    |__] |__|  |     |  | |___ .  

https://github.com/Steponass
*/                    

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
