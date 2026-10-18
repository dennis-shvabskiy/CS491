import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Users } from './pages/Users';
import { Layout } from './components/Layout';

function App() {

  return (


      <Router>
        <Routes>
          <Route element={<Layout/>}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Routes>
      </Router>

      
  )
}

export default App
