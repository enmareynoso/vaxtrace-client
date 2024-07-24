"use client";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import logo from "../../public/images/logo.png";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      id="home"
      className="bg-transparent backdrop-blur-lg p-4 border-b-2 border-cyan-900"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6">
        <div className="flex items-center space-x-8">
          <a href="#home" className="flex items-center -m-1.5 p-1.5">
            <Image src={logo} alt="Vaxtrace Logo" width={50} height={50} />
            <span className="ml-4 text-4xl font-bold text-gray-900 dark:text-white">
              Vaxtrace
            </span>
          </a>
        </div>
        <div className="hidden lg:flex space-x-8 px-10">
          <a
            href="#"
            className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            About us
          </a>
          <a
            href="#"
            className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            Vaccine Information
          </a>
          <a
            href="#faqs"
            className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            FAQs
          </a>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center space-x-4">
          <a
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Login
          </a>
          <a
            href="/auth/signup"
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-900 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-cyan-900"
          >
            Center Sign Up
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center -m-1.5 p-1.5">
              <Image src={logo} alt="Vaxtrace Logo" width={50} height={50} />
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                Vaxtrace
              </span>
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-200 dark:divide-gray-700">
              <div className="space-y-2 py-6">
                <a
                  href="#"
                  className="block px-3 py-2 text-base font-semibold text-gray-900 dark:text-white"
                >
                  About Us
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 text-base font-semibold text-gray-900 dark:text-white"
                >
                  Vaccine Information
                </a>
                <a
                  href="#faqs"
                  className="block px-3 py-2 text-base font-semibold text-gray-900 dark:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQs
                </a>
              </div>
              <div className="py-6">
                <a
                  href="/auth/login"
                  className="block px-3 py-2.5 text-base font-semibold text-gray-900 bg-gray-100 rounded-md dark:text-gray-200 dark:bg-gray-800"
                >
                  Login
                </a>
                <a
                  href="/auth/signup"
                  className="block px-3 py-2.5 text-base font-semibold text-white bg-cyan-900 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-cyan-900"
                >
                  Center Sign Up
                </a>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
