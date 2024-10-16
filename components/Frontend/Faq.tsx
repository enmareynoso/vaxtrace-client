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
              header="¿Cómo puedo aplicar como centro de vacunación?"
              text='Para aplicar como centro de vacunación en VaxTrace, debes hacer clic en la opción "Aplicar Centro" que encontrarás en la barra de navegación. Luego, deberás llenar el formulario de registro del centro. Después de completar todos los campos y aceptar los términos y condiciones, puedes proceder a aplicar. Una vez enviada la solicitud, el equipo de VaxTrace llevará a cabo un proceso de validación para verificar que la información proporcionada sea correcta. Si tu solicitud es aceptada, recibirás un correo electrónico confirmando la aprobación y un enlace para establecer tu contraseña. Si la solicitud es rechazada, te llegará un correo indicando el rechazo.'
            />
            <AccordionItem
              header="¿Es seguro usar VaxTrace para almacenar mi información de vacunación?"
              text="Sí, VaxTrace está diseñado con altos estándares de seguridad. Utiliza cifrado para proteger los datos personales y de vacunación. Solo el personal autorizado y los usuarios tienen acceso a la información, lo que garantiza que tus datos se mantengan privados y seguros."
            />
            <AccordionItem
              header="¿Cómo recibo notificaciones sobre mis vacunas?"
              text="Al registrar tus detalles de vacunación en VaxTrace, el sistema automáticamente te enviará recordatorios a tu correo electrónico para próximas dosis"
            />
          </div>
          <div className="w-full px-4 lg:w-1/2">
            <AccordionItem
              header="¿Qué hago si olvido mi contraseña de Vaxtrace?"
              text='Si olvidas tu contraseña, puedes utilizar la opción de recuperación de contraseña en la página de inicio de sesión. Simplemente haz clic en "¿Olvidaste tu contraseña?" e ingresa tu dirección de correo electrónico asociada a la cuenta. Recibirás un correo electrónico con un enlace para restablecer tu contraseña. Sigue las instrucciones proporcionadas y podrás establecer una nueva contraseña para recuperar el acceso a tu cuenta.'
            />
            <AccordionItem
              header="¿Cómo accedo al historial completo de vacunación de mi hijo?"
              text="Para acceder al historial completo de vacunación de tu hijo en VaxTrace, primero debes iniciar sesión en la cuenta del padre / tutor. Una vez dentro, dirígete a la sección Record y selecciona el hijo a visualizar el record. Al seleccionar su perfil, podrás consultar todo el historial de vacunación."
            />
            <AccordionItem
              header="¿Puedo descargar el registro de vacunación de mi hijo?"
              text="Sí, VaxTrace te permite descargar e imprimir el registro de vacunación de tu hijo. Solo necesitas acceder a su perfil desde tu cuenta, buscar la opción de descarga en formato PDF y guardarlo en tu dispositivo."
            />
          </div>
        </div>
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
    <div className="mb-8 w-full rounded-lg bg-white p-4 shadow-xl dark:bg-slate-700 dark:shadow-[0px_20px_50px_rgba(0,0,0,0.50)] sm:p-8 lg:px-6 xl:px-18">

      <button
        className="faq-btn flex w-full text-left"
        onClick={(e) => handleToggle(e)}
      >
        <div className="mr-5 flex h-10 w-full max-w-[40px] items-center justify-center rounded-lg bg-white border border-cyan-950 text-cyan-950 dark:bg-white/5 dark:text-primary-light">
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
