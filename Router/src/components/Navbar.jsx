import { Link } from "react-router-dom"
import "./Navbar.css"

export function Navbar() {
    return(
        <div className="navbar">
        <Link to="/">
        <button className="navbutton">Home</button>
        </Link>
        <Link to="/about">
        <button className="navbutton">About</button>
        </Link>
        <Link to="/users">
        <button className="navbutton">Users</button>
        </Link>
        </div>
    )
}