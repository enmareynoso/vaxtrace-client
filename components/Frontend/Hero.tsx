import React from "react";
import Image from 'next/image';
import MainImage from "../../images/heroImag.png";  // Asegúrate de que el nombre de archivo sea correcto

const Hero = () => {
  return (
    <div className="relative bg-transparent py-8 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex flex-wrap items-center">
          <div className="w-full lg:w-1/2 px-4">
            <div>
              <h1 className="text-4xl font-bold text-cyan-900 mb-4">
                Sistema Web para el registro de vacunación en la República Dominicana
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Obtén información de vacunas, recordatorios de vacunas y el historial de vacunación para tu protección y la de tus hijos.
              </p>
              <a href="#" className="bg-cyan-900 text-white font-medium rounded-md px-6 py-3 hover:bg-blue-700 transition-colors">
                Get Started
              </a>
            </div>
          </div>
          <div className="w-full lg:w-1/2 p-2 flex justify-end mx-auto">
            <div className="relative max-w-lg">
              <Image
                src={MainImage}
                alt="Vacunación"
                width={500}
                height={500}
                layout="intrinsic"
              />
               <span className="absolute -bottom-2 -left-2">
                    <svg
                      width="93"
                      height="93"
                      viewBox="0 0 93 93"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="2.5" cy="2.5" r="2.5" fill="#09475F" />
                      <circle cx="2.5" cy="24.5" r="2.5" fill="#09475F" />
                      <circle cx="2.5" cy="46.5" r="2.5" fill="#09475F" />
                      <circle cx="2.5" cy="68.5" r="2.5" fill="#09475F" />
                      <circle cx="2.5" cy="90.5" r="2.5" fill="#09475F" />
                      <circle cx="24.5" cy="2.5" r="2.5" fill="#09475F" />
                      <circle cx="24.5" cy="24.5" r="2.5" fill="#09475F" />
                      <circle cx="24.5" cy="46.5" r="2.5" fill="#09475F" />
                      <circle cx="24.5" cy="68.5" r="2.5" fill="#09475F" />
                      <circle cx="24.5" cy="90.5" r="2.5" fill="#09475F" />
                      <circle cx="46.5" cy="2.5" r="2.5" fill="#09475F" />
                      <circle cx="46.5" cy="24.5" r="2.5" fill="#09475F" />
                      <circle cx="46.5" cy="46.5" r="2.5" fill="#09475F" />
                      <circle cx="46.5" cy="68.5" r="2.5" fill="#09475F" />
                      <circle cx="46.5" cy="90.5" r="2.5" fill="#09475F" />
                      <circle cx="68.5" cy="2.5" r="2.5" fill="#09475F" />
                      <circle cx="68.5" cy="24.5" r="2.5" fill="#09475F" />
                      <circle cx="68.5" cy="46.5" r="2.5" fill="#09475F" />
                      <circle cx="68.5" cy="68.5" r="2.5" fill="#09475F" />
                      <circle cx="68.5" cy="90.5" r="2.5" fill="#09475F" />
                      <circle cx="90.5" cy="2.5" r="2.5" fill="#09475F" />
                      <circle cx="90.5" cy="24.5" r="2.5" fill="#09475F" />
                      <circle cx="90.5" cy="46.5" r="2.5" fill="#09475F" />
                      <circle cx="90.5" cy="68.5" r="2.5" fill="#09475F" />
                      <circle cx="90.5" cy="90.5" r="2.5" fill="#09475F" />
                    </svg>
                  </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

const SingleImage = ({ href, imgSrc }:{href:string, imgSrc:string}) => {
  return (
    <a href={href} className="flex w-full items-center justify-center">
      <img src={imgSrc} alt="brand image" className="h-10 w-full" />
    </a>
  );
};
