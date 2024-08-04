"use client"

import Image from "next/image"
import logo from "../../public/images/logo.png";
import { useRouter } from "next/navigation"

export function Logo() {
    const router = useRouter()
    return (
        <div className="flex items-center h-20 gap-2 px-6 border-b cursor-pointer min-h-20"
            onClick={() => router.push("/")}
        >
            <Image src={logo} alt="Vaxtrace Logo" width={50} height={50} />
            <h1 className="text-xl font-bold">Vaxtrace</h1>
        </div>
    )
}
