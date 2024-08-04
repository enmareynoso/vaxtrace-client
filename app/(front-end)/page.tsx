"use client";
import Accordion from "@/components/Frontend/Faq";
import Feature from "@/components/Frontend/Feature";
import Hero from "@/components/Frontend/Hero";

export default function Home() {
  return (
    <section className="max-w-6xl mx-auto">
      <Hero />
      <Feature />
      <Accordion />
    </section>
  );
}
