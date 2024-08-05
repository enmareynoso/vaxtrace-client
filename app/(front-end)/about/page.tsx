import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8">
        <h2 className="text-3xl font-bold mb-4">About Us</h2>
        <p className="mb-4">
          VaxTrace is a leading platform dedicated to tracking and managing
          vaccinations efficiently. Our mission is to ensure the highest level
          of vaccine security and accessibility.
        </p>
        <p className="mb-4">
          Our team is committed to providing users with the most reliable and
          user-friendly tools to keep their vaccination records safe and
          updated.
        </p>
      </main>
    </div>
  );
};

export default AboutPage;
