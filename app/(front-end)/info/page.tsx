import React from "react";

const ImmunizationSchedule: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Esquema Básico de Inmunización</h1>
      
      <div className="max-w-full overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-cyan-900 text-white">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Edades de Vacunación</th>
              <th className="border border-gray-300 px-4 py-2">Nombre de la Vacuna</th>
              <th className="border border-gray-300 px-4 py-2">Enfermedades que Previene</th>
              <th className="border border-gray-300 px-4 py-2">Dosis</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-blue-100">
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToQoG5CKsMu6hTIko05S9tyMAy3a3eZlakpA&s" alt="Bebé al nacer" className="h-32 w-28 rounded-full shadow-md mb-2" />
                  Al Nacer
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>BCG</strong><br />
                <strong>Hepatitis B</strong>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>BCG:</strong> Formas graves de Tuberculosis<br />
                <strong>Hepatitis B:</strong> Infección por Hepatitis B en recién nacidos
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">Dosis Única</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center">
                  <img src="https://i.pinimg.com/736x/99/41/6d/99416dcba1b5f3bb9327a9d384d38af9.jpg" alt="Bebé 2 meses" className="h-32 w-28 rounded-full shadow-md mb-2" />
                  2 Meses
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>Rotavirus</strong><br />
                <strong>IPV</strong><br />
                <strong>Neumococo</strong><br />
                <strong>Pentavalente</strong>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>Rotavirus:</strong> Diarreas graves<br />
                <strong>IPV:</strong> Poliomielitis<br />
                <strong>Neumococo:</strong> Enfermedades graves producidas por el Neumococo<br />
                <strong>Pentavalente:</strong> Difteria, Tétanos, Tos Ferina, Hepatitis B y Haemophilus Influenzae B
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">1ra Dosis</td>
            </tr>
            <tr className="bg-blue-100">
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center">
                  <img src="https://tipsdemadre.com/wp-content/uploads/2014/07/bebe-cuatro-meses.jpg" alt="Bebé 4 meses" className="h-32 w-28 rounded-full shadow-md mb-2" />
                  4 Meses
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>Rotavirus</strong><br />
                <strong>bOPV</strong><br />
                <strong>Neumococo</strong><br />
                <strong>Pentavalente</strong>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>Rotavirus:</strong> Diarreas graves<br />
                <strong>bOPV:</strong> Poliomielitis<br />
                <strong>Neumococo:</strong> Enfermedades graves producidas por el Neumococo<br />
                <strong>Pentavalente:</strong> Difteria, Tétanos, Tos Ferina, Hepatitis B y Haemophilus Influenzae B
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">2da Dosis</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center">
                  <img src="https://www.shutterstock.com/image-vector/smiling-cute-cartoon-baby-girl-260nw-1509642590.jpg" alt="Bebé 6 meses" className="h-32 w-28 rounded-full shadow-md mb-2" />
                  6 Meses
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>IPV</strong><br />
                <strong>Pentavalente</strong>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>IPV:</strong> Poliomielitis<br />
                <strong>Pentavalente:</strong> Difteria, Tétanos, Tos Ferina, Hepatitis B y Haemophilus Influenzae B
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">3ra Dosis</td>
            </tr>
            <tr className="bg-blue-100">
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center">
                  <img src="https://us.123rf.com/450wm/natoushe/natoushe1910/natoushe191000419/132203112-beb%C3%A9-de-12-meses-hitos-del-desarrollo-del-beb%C3%A9-en-el-primer-a%C3%B1o.jpg?ver=6" alt="Bebé 12 meses" className="h-36 w-32 rounded-full shadow-md mb-2" />
                  12 Meses
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>SRP</strong><br />
                <strong>Neumococo</strong>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>SRP:</strong> Sarampión, Rubéola y Paperas<br />
                <strong>Neumococo:</strong> Enfermedades graves producidas por el Neumococo
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">1ra Dosis (Refuerzo)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStqpVAHwHvLHahQ8Duk_7bQ49xZmek_EnLmQ&s" alt="Bebé 18 meses" className="h-40 w-38 rounded-full shadow-md mb-2" />
                  18 Meses
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>SRP</strong><br />
                <strong>bOPV</strong><br />
                <strong>DPT</strong>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>SRP:</strong> Sarampión, Rubéola y Paperas<br />
                <strong>bOPV:</strong> Poliomielitis<br />
                <strong>DPT:</strong> Difteria, Tétanos, Tos Ferina
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">2da Dosis (1er Refuerzo)</td>
            </tr>
            <tr className="bg-blue-100">
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center">
                  <img src="https://casitadelasamapolas.wordpress.com/wp-content/uploads/2014/12/images1.jpg" alt="Bebé 4 años" className="h-36 w-32 rounded-full shadow-md mb-2" />
                  4 Años
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>bOPV</strong><br />
                <strong>DPT</strong>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>bOPV:</strong> Poliomielitis<br />
                <strong>DPT:</strong> Difteria, Tétanos, Tos Ferina
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">2da Dosis (2do Refuerzo)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center">
                  <img src="https://e7.pngegg.com/pngimages/656/195/png-clipart-universal-childrens-day-november-14-wish-cute-cartoon-boy-cartoon-character-tshirt.png" alt="Bebé 18 meses" className="h-40 w-38 rounded-full shadow-md mb-2" />
                  9 - 14 Años
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>TD</strong><br />
                <strong>VPH</strong><br />
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <strong>TD:</strong> Difteria, Tétanos<br />
                <strong>VPH:</strong> Virus del papiloma humano<br />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">2da Dosis (1er Refuerzo)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImmunizationSchedule;
