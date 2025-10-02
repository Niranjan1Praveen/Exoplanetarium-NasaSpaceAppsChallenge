"use client";

import Image from "next/image";

interface LogoProps {
  width?: number; 
}

export default function Logo({ width = 100 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width={100}
      height={100} 
      className={`py-2 w-${width}`}
    />
  );
}
