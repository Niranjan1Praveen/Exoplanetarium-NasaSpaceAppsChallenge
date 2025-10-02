"use client";

import { Card, CardContent } from "@/components/ui/card";

const teamMembers = [
  {
    name: "Debshata Choudhury",
    role: "Team Lead / Data Engineer",
    image: "/team/debshata.jpeg",
  },
  {
    name: "Niranjan Praveen",
    role: "Frontend Engineer / Database Engineer",
    image: "/team/niranjan.png",
  },
  {
    name: "Vaibhav Jain",
    role: "Frontend Engineer / API Engineer",
    image: "/team/vaibhav.jpeg",
  },
  {
    name: "Abhishek Chaubey",
    role: "3D Visualization Specialist",
    image: "/team/ethan.jpg",
  },
  {
    name: "Pratham Ranjhan",
    role: "3D Visualization Specialist",
    image: "/team/pratham.png",
  },
  {
    name: "Shreyansh Jaiswal",
    role: "Exoplanet Analyst",
    image: "/team/liam.jpg",
  },
];

export default function MeetOurTeam() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold sm:text-4xl">Meet Our Team</h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          A group of passionate engineers pushing the boundaries of exoplanet
          discovery.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card
            key={member.name}
            className="relative h-80 overflow-hidden border-0 rounded-tr-none rounded-bl-none rounded-tl-[75px] rounded-br-[75px]"
          >
            <CardContent className="p-0 h-full">
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover hover:blur-xl transition-all duration-500 bg-[center_20%]"
                style={{ backgroundImage: `url(${member.image})` }}
              />

              {/* Overlay for text */}
              <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/60 to-transparent w-full">
                <h3 className="text-lg font-semibold text-white">
                  {member.name}
                </h3>
                <p className="text-sm text-white">{member.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
