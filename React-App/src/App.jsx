import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

const FUN_FACTS = [
  "Honey never spoils; edible honey has been found in ancient Egyptian tombs.",
  "Octopuses have three hearts and blue blood.",
  "Bananas are curved because they grow toward the sun against gravity.",
  "A group of flamingos is called a 'flamboyance'.",
  "Venus is the only planet in our solar system that spins clockwise.",
  "Wombat poop is cube-shaped to stop it from rolling away.",
  "The first computer bug was an actual real-life moth found in 1947."
]

function App() {
  const [fact, setFact] = useState("Click to reveal a fun fact!")

  const getRandomFact = () => {
    const remainingFacts = FUN_FACTS.filter((f) => f !== fact)
    const nextFact = remainingFacts[Math.floor(Math.random() * remainingFacts.length)]
    setFact(nextFact)
  }

  return (
    <section id="center">
      <div className="hero">
        <img src={heroImg} className="base" width="170" height="179" alt="" />
        <img src={reactLogo} className="framework" alt="React logo" />
        <img src={viteLogo} className="vite" alt="Vite logo" />
      </div>
      <div>
        <h1>Fun Fact Generator</h1>
      </div>

      <p className="fact-label">Random Fact Generator</p>

      <button
        type="button"
        className="counter"
        onClick={getRandomFact}
      >
        {fact}
      </button>
    </section>
  )
}

export default App