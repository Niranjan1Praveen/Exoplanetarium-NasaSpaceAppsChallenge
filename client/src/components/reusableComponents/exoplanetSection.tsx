"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import ExoplanetModel from "./exoplanetModel";
import { BlurFade } from "../ui/blur-fade";
import { motion, useScroll, useTransform } from "framer-motion";
import { Particles } from "../ui/particles";
import { Badge } from "../ui/badge";


export default function ExoplanetSection() {
  const planetModels = [
    {
      modelPath: "/models/Kepler-186_f.glb",
      fov: 50,
    },
    {
      modelPath: "/models/volcano.glb",
      fov: 50,
    },
    {
      modelPath: "/models/ringedGasGiant.glb",
      fov: 50,
    },
    {
      modelPath: "/models/rocky.glb",
      fov: 50,
    },
    {
      modelPath: "/models/lp_791-18d.glb",
      fov: 55,
    },
    {
      modelPath: "/models/blueGasGiant.glb",
      fov: 50,
    },
  ];

  return (
    <section className="relative py-16 sm:px-6 px-4 lg:px-8">
      <Particles
          className="absolute inset-0"
          quantity={100}
          size={0.1}
          ease={80}
          refresh
        />
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-12">
        <div className="md:w-1/2 space-y-4 text-center md:text-left">
          <BlurFade delay={0.25} inView>
            <Badge variant={"secondary"}>Introduction</Badge>
            <h2 className="text-3xl md:text-4xl font-bold leading-snug">
              Exoplanets Come in All Shapes, Sizes, and Colors
            </h2>
          </BlurFade>

          <BlurFade delay={0.25 * 2} inView>
            <p className="text-lg text-muted-foreground">
              From scorching hot Jupiters to rocky super-Earths, these distant
              worlds reveal the diversity of planets that exist beyond our solar
              system.
            </p>
          </BlurFade>
        </div>

        <motion.div className="md:w-1/2 h-[400px] hidden lg:flex" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} viewport={{ once: true }}>
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            loop
            autoplay={{
              delay: 3000, 
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
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}
