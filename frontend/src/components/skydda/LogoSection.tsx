import React from 'react';
import { LogoCloud } from '../ui/logo-cloud-2';

export function LogoSection() {
  return (
    <section className="relative w-full bg-zinc-900 py-16 md:py-24 border-b border-zinc-700/30">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <h2 className="mb-12 text-center font-normal text-3xl md:text-4xl lg:text-5xl text-white tracking-tight">
          Calibrated against industry standards at leading engineering teams
        </h2>

        <LogoCloud />
      </div>
    </section>
  );
}
