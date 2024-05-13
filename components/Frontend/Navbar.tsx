"use client";
import { useState } from 'react';
import { Dialog, Popover } from '@headlessui/react';
import Image from 'next/image';
import logo from "../../images/logo.png";
import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-transparent p-4">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex items-center lg:flex-1">
          <a href="#" className="flex items-center -m-1.5 p-1.5">
            <Image className="h-8 w-auto" src={logo} alt="Vaxtrace Logo" />
            <span className="ml-2 text-xl font-semibold text-gray-900">Vaxtrace</span>
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <Popover.Group className="hidden lg:flex lg:gap-x-12">
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 hover:text-sky-500">
            Home
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 hover:text-sky-500">
            Services
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 hover:text-sky-500">
            About Us
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 hover:text-sky-500">
            Contact Us
          </a>
        </Popover.Group>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center space-x-4">
          <a
            href="#"
            className="px-4 py-2 text-sm font-medium text-white bg-sky-400 rounded-md hover:bg-sky-500"
          >
            Sign in
          </a>
          <a
            href="#"
            className="px-4 py-2 text-sm font-medium text-white bg-sky-400 rounded-md hover:bg-sky-500"
          >
            Sign up
          </a>
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center -m-1.5 p-1.5">
              <Image className="h-8 w-auto" src={logo} alt="Vaxtrace Logo" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Vaxtrace</span>
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-sky-500">
              <div className="space-y-2 py-6">
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Home
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Services
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  About Us
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Contact Us
                </a>
              </div>
              <div className="py-6">
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Sign in
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
