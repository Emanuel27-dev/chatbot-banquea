import { ChatLayout } from './components/ChatLayout'
import { PinView } from './components/PinView'
import { Routes, Route } from 'react-router'



function App() {
  
  return (
    <Routes>
      <Route path="/" element={<PinView />} />
      <Route path="/chat" element={<ChatLayout />} />
    </Routes>
  )
}

export default App
