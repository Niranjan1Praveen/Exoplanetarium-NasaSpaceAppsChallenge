"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { BlurFade } from "../ui/blur-fade";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import LazyVisible from "./lazyVisible";

// three.js + the R3F renderer are ~500 kB of JS and are useless on the server,
// so they load only once this carousel is near the viewport.
const ExoplanetModel = dynamic(() => import("./exoplanetModel"), { ssr: false });
const Particles = dynamic(
  () => import("../ui/particles").then((m) => m.Particles),
  { ssr: false }
);


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

  // Only the visible slide gets a live canvas. Rendering all six at once meant
  // six WebGL contexts and six model downloads on first paint; drei's useGLTF
  // caches parsed models by URL, so revisiting a slide is essentially free.
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <section className="relative py-16 sm:px-6 px-4 lg:px-8">
      <LazyVisible className="absolute inset-0" rootMargin="300px">
        <Particles
          className="absolute inset-0"
          quantity={100}
          size={0.1}
          ease={80}
          refresh
        />
      </LazyVisible>
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
          <LazyVisible className="w-full" rootMargin="300px">
            <Swiper
              spaceBetween={30}
              slidesPerView={1}
              loop
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              modules={[Autoplay]}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            >
              {planetModels.map((planet, index) => (
                <SwiperSlide key={index}>
                  <div className="h-[400px] w-full">
                    {index === activeIndex && (
                      <ExoplanetModel
                        modelPath={planet.modelPath}
                        fov={planet.fov}
                      />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </LazyVisible>
        </motion.div>
      </div>
    </section>
  );
}
