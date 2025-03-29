import { FaFacebook, FaAirbnb, FaApple, FaQuora, FaSass } from "react-icons/fa";
import { SiSamsung } from "react-icons/si";

export default function LogoCarousel() {
  const logos = [
    { src: <FaFacebook size={24} />, alt: "Facebook" },
    { src: <FaAirbnb size={24} />, alt: "Airbnb" },
    { src: <FaApple size={24} />, alt: "Apple" },
    { src: <SiSamsung size={24} />, alt: "Samsung" },
    { src: <FaQuora size={24} />, alt: "Quora" },
    { src: <FaSass size={24} />, alt: "Sass" },
  ];

  return (
    <div className="relative w-full h-36 bg-white flex justify-center overflow-hidden">
      <div className="absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-orange-500 to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-orange-500 to-transparent" />
      
      <div className="inline-flex w-full flex-nowrap">
        <ul className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_li]:mx-8">
          {logos.map((logo, index) => (
            <li key={index} className="text-gray-700 flex hover:text-gray-900">
              {logo.src} {logo.alt}
            </li>
          ))}
        </ul>
        <ul
          className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_li]:mx-8"
          aria-hidden="true"
        >
          {logos.map((logo, index) => (
            <li key={index} className="text-gray-700 flex hover:text-gray-900">
              {logo.src} {logo.alt}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}