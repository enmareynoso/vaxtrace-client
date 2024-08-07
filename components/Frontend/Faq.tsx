import React, { useState } from "react";

const Accordion = () => {
  return (
    <section
      id="faqs"
      className="relative z-20 overflow-hidden bg-transparent pb-12 dark:bg-dark lg:pb-[90px] lg:pt-[40px]"
    >
      <div className="container mx-auto">
        <div className="flex flex-wrap">
          <div className="w-full px-8">
            <div className="mx-auto mb-[60px] max-w-[520px] text-center lg:mb-20">
              <span className="mb-2 block text-lg font-semibold text-primary dark:text-primary-light">
                FAQ
              </span>
              <h2 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-[40px]/[48px]">
                Preguntas Frecuentes?
              </h2>
              <p className="text-base text-body-color dark:text-gray-400">
                ¿Tienes una duda? Aquí tenemos un set de preguntas frecuentes
                para aclararlas
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full px-8 lg:w-1/2 ">
            <AccordionItem
              header="¿Cómo puedo registrarme en VaxTrace?"
              text="Infoooo."
            />
            <AccordionItem
              header="¿Es seguro usar VaxTrace para almacenar mi información de vacunación?"
              text="Sí, la seguridad es nuestra máxima prioridad. Utilizamos encriptación de datos avanzada y autenticación multifactor para proteger tu información y garantizar que solo tú puedas acceder a ella."
            />
            <AccordionItem
              header="¿Cómo recibo notificaciones sobre mis vacunas?"
              text="Al registrar tus detalles de vacunación en VaxTrace, el sistema automáticamente te enviará recordatorios a tu correo electrónico o teléfono móvil para próximas dosis o vacunas recomendadas."
            />
          </div>
          <div className="w-full px-4 lg:w-1/2">
            <AccordionItem
              header="¿Qué hago si pierdo acceso a mi cuenta de VaxTrace?"
              text="Infooooo."
            />
            <AccordionItem
              header="How do I access my child’s full vaccination record?"
              text="Infooooo."
            />
            <AccordionItem
              header="Can I download my child’s vaccination record?"
              text="Infoooooooo."
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 z-[-1]">
        <svg
          width="1440"
          height="886"
          viewBox="0 0 1440 886"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.5"
            d="M193.307 -273.321L1480.87 1014.24L1121.85 1373.26C1121.85 1373.26 731.745 983.231 478.513 729.927C225.976 477.317 -165.714 85.6993 -165.714 85.6993L193.307 -273.321Z"
            fill="url(#paint0_linear)"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="1908.65"
              y1="1642.58"
              x2="602.827"
              y2="-418.681"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#3056D3" stopOpacity="0.36" />
              <stop offset="1" stopColor="#54C8F1" stopOpacity="0.3" />
              <stop offset="1" stopColor="#54C8F1" stopOpacity="0.096144" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default Accordion;

const AccordionItem = ({ header, text }: { header: string; text: string }) => {
  const [active, setActive] = useState(false);

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setActive(!active);
  };

  return (
    <div className="mb-8 w-full rounded-lg bg-white p-4 shadow-[0px_20px_95px_0px_rgba(201,203,204,0.30)] dark:bg-slate-700 dark:shadow-[0px_20px_95px_0px_rgba(0,0,0,0.30)] sm:p-8 lg:px-6 xl:px-18">
      <button
        className="faq-btn flex w-full text-left"
        onClick={(e) => handleToggle(e)}
      >
        <div className="mr-5 flex h-10 w-full max-w-[40px] items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-white/5 dark:text-primary-light">
          <svg
            className={`fill-primary stroke-primary duration-200 ease-in-out ${
              active ? "rotate-180" : ""
            }`}
            width="17"
            height="10"
            viewBox="0 0 17 10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.28687 8.43257L7.28679 8.43265L7.29496 8.43985C7.62576 8.73124 8.02464 8.86001 8.41472 8.86001C8.83092 8.86001 9.22376 8.69083 9.53447 8.41713L9.53454 8.41721L9.54184 8.41052L15.7631 2.70784L15.7691 2.70231L15.7749 2.69659C16.0981 2.38028 16.1985 1.80579 15.7981 1.41393C15.4803 1.1028 14.9167 1.00854 14.5249 1.38489L8.41472 7.00806L2.29995 1.38063L2.29151 1.37286L2.28271 1.36548C1.93092 1.07036 1.38469 1.06804 1.03129 1.41393L1.01755 1.42738L1.00488 1.44184C0.69687 1.79355 0.695778 2.34549 1.0545 2.69659L1.05999 2.70196L1.06565 2.70717L7.28687 8.43257Z"
              fill="currentColor"
              stroke="currentColor"
            />
          </svg>
        </div>
        <div className="w-full">
          <h4 className="mt-1 text-lg font-semibold text-dark dark:text-white">
            {header}
          </h4>
        </div>
      </button>

      <div
        className={`pl-[62px] duration-200 ease-in-out ${
          active ? "block" : "hidden"
        }`}
      >
        <p className="py-3 text-base leading-relaxed text-body-color dark:text-gray-400">
          {text}
        </p>
      </div>
    </div>
  );
};
