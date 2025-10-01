"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import ExoplanetModel from "./exoplanetModel";

export default function ExoplanetSection() {
  const planetModels = [
    {
      modelPath: "/models/blue_gas_giant.glb",
      fov: 70,
      scale: 3
    },
    {
      modelPath: "/models/rocky.glb",
      fov: 50,
    },
    {
      modelPath: "/models/lp_791-18d.glb",
      fov: 65,
    },
    {
      modelPath: "/models/kepler-186f.glb",
      fov: 65,
    },
  ];

  return (
    <section className="py-16 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="md:w-1/2 space-y-4 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold leading-snug">
            Exoplanets Come in All Shapes, Sizes, and Colors
          </h2>

          <p className="text-lg text-muted-foreground">
            From scorching hot Jupiters to rocky super-Earths, these distant
            worlds reveal the diversity of planets that exist beyond our solar
            system.
          </p>
        </div>

        <div className="md:w-1/2 h-[400px]">
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            loop
            autoplay={{
              delay: 5000, // 2s
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
          >
            {planetModels.map((planet, index) => (
              <SwiperSlide key={index}>
                <div className="h-[400px] w-full">
                  <ExoplanetModel
                    modelPath={planet.modelPath}
                    fov={planet.fov}
                    scale={planet.scale}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
