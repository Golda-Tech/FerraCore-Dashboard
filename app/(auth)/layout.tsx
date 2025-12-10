import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-[#f2f4f7]">
      {/* LEFT – logo + headline + customer PNG (full bleed) */}
      <div className="relative hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-10 bg-[#f2f4f7]">
        {/* Rexhub logo – large, top */}
        <Image
          src="/rexpay-logo.png"
          alt="Rexpay Logo"
          width={200}
          height={60}
          className="object-contain self-start ml-4"
        />

      {/* Headline – left aligned, stacked */}
      <div className="mt-8 mb-8 self-start">
        <h1 className="text-4xl font-semibold text-zinc-800">Grow Your Business</h1>
        <h2 className="text-4xl font-semibold text-zinc-800">With Seamless Mobile Money</h2>
        <h2 className="text-4xl font-semibold text-zinc-800">Collections</h2>
      </div>

        {/* customer PNG – left aligned, inset slightly */}
        <Image
          src="/rexpaycustomer.png"
          alt="Collections UI"
          width={400}
          height={240}
          className="object-contain self-start ml-4"
        />
      </div>

      {/* RIGHT – login form (unchanged) */}
      <div className="flex flex-1 items-center justify-center px-5 py-10 bg-[#f2f4f7]">
        <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}