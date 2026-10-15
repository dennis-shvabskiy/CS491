import Hello from "./hello.json"
import Lottie from "react-lottie"

export default function Home() {
  return (
    <div>
      <Lottie animationData={Hello} />
      <h2>Home</h2>
      <p>Welcome to my website</p>
    </div>
  );
}