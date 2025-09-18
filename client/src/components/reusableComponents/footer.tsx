import React from "react";
import { Instagram, Youtube, Linkedin, Twitter, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="px-6 md:px-16 py-12">
      <div
        className="max-w-7xl mx-auto grid gap-10 lg:gap-16
                      grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Left Section */}
        <div>
          <h1 className="font-bold text-xl mb-3">LOGO</h1>
          <p className="text-sm leading-relaxed mb-5">
            Experience the next generation of SEO analytics.
          </p>
          <button className="border px-6 py-2 rounded-full text-sm">
            Unlimited trial for 14 days
          </button>
        </div>

        {/* Platform, Legals & Wope for */}
        <div className="flex flex-wrap gap-12">
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#">Pricing</a>
              </li>
              <li>
                <a href="#">Partnership</a>
              </li>
              <li>
                <a href="#">Affiliate</a>
              </li>
              <li>
                <a href="#">Download</a>
              </li>
              <li>
                <a href="#">Contact Us</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legals</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#">Terms of Services</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Wope for</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#">Agencies</a>
              </li>
              <li>
                <a href="#">Startups</a>
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
              651 N Broad St
              <br />
              Suite 201
              <br />
              Middletown, Delaware 19709
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
        <p>©2025 Wope. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="#" aria-label="Instagram">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" aria-label="YouTube">
            <Youtube className="w-5 h-5" />
          </a>
          <a href="#" aria-label="LinkedIn">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="#" aria-label="Twitter">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
