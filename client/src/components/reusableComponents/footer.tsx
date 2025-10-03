import React from "react";
import { Instagram, Youtube, Linkedin, Twitter, MapPin } from "lucide-react";
import Logo from "./logo";
import { Button } from "../ui/button";

export default function Footer() {
  return (
    <footer className="px-6 md:px-16 py-12">
      <div
        className="max-w-7xl mx-auto grid gap-10 lg:gap-16
                      grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Left Section */}
        <div>
          <Logo width={40} />
          <p className="text-sm leading-relaxed mb-5">
            Discovering worlds beyond our solar system through
            AI-powered analysis and immersive visualization.
          </p>
          <Button variant={"ghost"}>
            Join Our Mission
          </Button>
        </div>

        {/* Explore, Resources & Community */}
        <div className="flex flex-wrap gap-12">
          <div>
            <h3 className="font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#">Exoplanet Database</a>
              </li>
              <li>
                <a href="#">Visualization Lab</a>
              </li>
              <li>
                <a href="#">AI Predictions</a>
              </li>
              <li>
                <a href="#">Publications</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#">For Students</a>
              </li>
              <li>
                <a href="#">For Researchers</a>
              </li>
              <li>
                <a href="#">For Educators</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Get in touch */}
        <div className="border rounded-xl p-5">
          <h3 className="font-semibold mb-3">Get in touch</h3>
          <div className="flex items-start text-sm leading-relaxed">
            <MapPin className="w-4 h-4 mt-1 mr-2" />
            <p>
              Exoplanetarium HQ
              <br />
              Space Research Center
              <br />
              Cambridge, MA 02139
              <br />
              United States
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-7xl mx-auto mt-12 pt-6 border-t flex flex-col md:flex-row
                      justify-between items-center gap-4 text-sm"
      >
        <p>©2025 Exoplanetarium. Exploring new worlds together.</p>
        <div className="flex gap-5">
          <a href="#" aria-label="Instagram" className="pointer-events-none">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" aria-label="YouTube" className="pointer-events-none">
            <Youtube className="w-5 h-5" />
          </a>
          <a href="#" aria-label="LinkedIn" className="pointer-events-none">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="#" aria-label="Twitter" className="pointer-events-none">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
