import LottiePackage from "react-lottie"
//Handle CJS/ESM bundler interop
const Lottie = LottiePackage.default || LottiePackage;
import Hello from "../assets/hello.json"
export function Home() {
  //Animation configuration
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: Hello,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div>
      <h2>Home</h2>

      <Lottie 
        options={defaultOptions} 
        height={300} 
        width={500} 
      />
      <p>Welcome to my website</p>
    </div>
  );
}