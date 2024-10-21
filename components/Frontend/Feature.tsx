import {
  ClipboardDocumentIcon,
  ShieldCheckIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";

const ServiceCard = ({
  Icon,
  title,
  description,
}: {
  Icon: any;
  title: any;
  description: any;
}) => {
  return (
    <div className="w-full px-4 md:w-1/4">
      <div className="mx-auto mb-10 w-full max-w-sm h-[350px] flex flex-col items-center text-center bg-white rounded-xl overflow-hidden shadow-lg dark:bg-slate-300">
        <div className="p-6 flex flex-col justify-between h-full">
          <Icon className="mx-auto h-12 w-16 text-cyan-800 dark:text-black" />
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-gray-700">{description}</p>
        </div>
      </div>
    </div>
  );
};

const Feature = () => {
  return (
    <section className="bg-transparent py-10" id="services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl xl:text-5xl dark:text-white">
            ¿Qué ofrecemos?
          </h2>
          <p className="mt-4 text-base text-gray-600 dark:text-white">
            Estamos dedicados a brindarle la comodidad y servicios que harán de
            este proceso un mejor momento.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 dark:text-black">
          <ServiceCard
            Icon={BellAlertIcon}
            title="Nunca más olvides una vacuna"
            description="Recibirás una notificación automática en tu correo electrónico para mantenerte actualizado sobre próximas dosis"
          />
          <ServiceCard
            Icon={ClipboardDocumentIcon}
            title="Registro Integral de Vacunación"
            description="Mantenga, vea y descargue un historial de vacunación detallado de todos sus hijos, garantizando información accesible y organizada."
          />
          <ServiceCard
            Icon={ShieldCheckIcon}
            title="Información de Vacunas al alcance"
            description="Obtenga información relevante de las vacunas registradas en nuestro sistema y las jornadas de vacunación por edades."
          />
        </div>
      </div>
    </section>
  );
};

export default Feature;
