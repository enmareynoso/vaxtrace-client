import React from "react";

const InformationPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8">
        <h2 className="text-3xl font-bold mb-4">Vaccine Information</h2>
        <p className="mb-4">
          Stay informed about the latest developments in vaccine technology and
          distribution. Our platform provides accurate and timely information to
          help you make informed decisions.
        </p>
        <ul className="list-disc list-inside">
          <li>Benefits of vaccination</li>
          <li>Vaccine safety and effectiveness</li>
          <li>Upcoming vaccines and developments</li>
        </ul>
      </main>
    </div>
  );
};

export default InformationPage;
