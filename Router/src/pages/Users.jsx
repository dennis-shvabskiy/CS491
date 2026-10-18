import LottiePackage from "react-lottie"
//Handle CJS/ESM bundler interop
const Lottie = LottiePackage.default || LottiePackage;
import Us from "../assets/connect.json"

export function Users() {
  //Animation configuration
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: Us,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div>
      <h2>Users</h2>
      <Lottie 
        options={defaultOptions} 
        height={300} 
        width={700} 
      />
      <p>In Users</p>
    </div>
  );
}