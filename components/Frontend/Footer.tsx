import Image from 'next/image';
import logo from "../../images/logo.png";

export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-cyan-900">
      <div className="mx-auto max-w-7xl flex flex-wrap justify-between items-center p-6">
        <div className="flex-1 flex justify-center lg:justify-start items-center mb-4 lg:mb-0">
          <a href="#home" className="flex items-center space-x-4">
            <Image src={logo} alt="Vaxtrace Logo" width={50} height={50} />
            <span className="text-xl font-bold text-gray-800">Vaxtrace</span>
          </a>
        </div>
        <div className="text-sm font-medium text-gray-800 text-center lg:text-right">
          © Copyright Reserved 2024
        </div>
      </div>
    </footer>
  );
}
