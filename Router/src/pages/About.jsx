import LottiePackage from "react-lottie"
const Lottie = LottiePackage.default || LottiePackage;
import Us from "../assets/about-us.json"

export function About() {
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
      <h2>About</h2>
      <Lottie
        options={defaultOptions} 
        height={300} 
        width={500}
      />
      <p>About the site</p>
    </div>
  );
}