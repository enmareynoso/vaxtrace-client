import React from "react";
import { FaCheckCircle, FaEye } from 'react-icons/fa'; // Importamos el nuevo ícono FaEye

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-cyan-900 text-white py-6">
        <div className="container mx-auto px-8">
          <h1 className="text-4xl font-extrabold">Sobre Nosotros</h1>
          <p className="mt-2 text-lg">Conoce más sobre VaxTrace y nuestra misión</p>
        </div>
      </header>

      <main className="flex-grow p-8 container mx-auto">
        {/* Sección de Misión */}
        <section className="mb-12 bg-gradient-to-r from-cyan-50 to-white p-10 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold mb-6 text-cyan-900 flex items-center">
             Nuestra Misión <FaCheckCircle className="text-cyan-600 ml-4" />
          </h2>
          <p className="mb-4 text-lg text-gray-700">
            En VaxTrace, nuestra misión es garantizar un acceso fácil y seguro a la información de vacunación para todos. A través de nuestra plataforma innovadora, ofrecemos soluciones que permiten a los usuarios rastrear y gestionar sus vacunas de manera eficiente, asegurando que estén al día con sus necesidades de inmunización.
          </p>
          <p className="text-lg text-gray-700">
            Creemos en el poder de la tecnología para simplificar la atención médica, protegiendo la privacidad de los usuarios y brindando herramientas accesibles para las comunidades.
          </p>
        </section>

        {/* Sección de Visión */}
        <section className="mb-12 bg-white p-10 rounded-lg shadow-lg border-t-4 border-cyan-600">
          <h2 className="text-4xl font-bold mb-6 text-cyan-900 flex items-center">
             Nuestra Visión <FaEye className="text-cyan-600 ml-4" />
          </h2>
          <p className="text-lg mb-4 text-gray-700">
            En VaxTrace, aspiramos a un futuro donde la gestión de vacunas sea completamente digital, accesible para todos, y permita a individuos y organizaciones tomar decisiones informadas sobre su salud. Nuestra visión es un mundo donde las enfermedades prevenibles sean cosa del pasado, gracias a un seguimiento eficiente y una mayor participación en los programas de vacunación.
          </p>
          <p className="text-lg text-gray-700">
            Nos esforzamos por colaborar con sistemas de salud pública, gobiernos y entidades privadas para crear un ecosistema donde la vacunación sea simple, transparente y universalmente accesible.
          </p>
        </section>

        {/* Sección de Beneficios */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-cyan-900">Beneficios de Usar VaxTrace</h2>
          <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
            <li>
              <strong>Acceso fácil y rápido:</strong> Todos tus registros de vacunación disponibles al instante, desde cualquier lugar y en cualquier momento.
            </li>
            <li>
              <strong>Seguridad de datos:</strong> Nuestro sistema está diseñado con los más altos estándares de seguridad para proteger tu información personal y médica.
            </li>
            <li>
              <strong>Notificaciones oportunas:</strong> Recibe recordatorios automáticos sobre tus próximas dosis de vacunas o refuerzos, para que nunca pierdas una fecha importante.
            </li>
            <li>
              <strong>Integración con sistemas de salud:</strong> VaxTrace se conecta con hospitales, clínicas y otras instituciones para mantener tus registros siempre actualizados.
            </li>
            <li>
              <strong>Fácil de compartir:</strong> Comparte tu historial de vacunación con profesionales médicos, escuelas u organizaciones de manera sencilla y segura.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;



