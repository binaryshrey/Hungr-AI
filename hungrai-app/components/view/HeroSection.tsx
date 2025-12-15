"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#000000] text-white">
      {/* subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.80]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-8 py-24 lg:py-28 ">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left content */}
          <div className="space-y-8 mt-2">
            <Badge
              variant="secondary"
              className="w-fit rounded-full bg-gray-100/20 px-4 py-1 text-sm text-white/90 backdrop-blur-xl border border-white/40 shadow-lg"
            >
              ECE-GY 6143 · Intro to Machine Learning Project
            </Badge>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-4xl -mt-2">
              Food Ingredient Classification and Recipe Recommondation using CNN
              and Transfer Learning
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              The project presents an end-to-end deep learning system that
              identifies fruits and vegetables from images and recommends
              recipes based on the detected ingredients, covering data
              preprocessing, model training, evaluation, and web deployment.
            </p>

            <div className="flex items-center gap-6">
              <Link href="/upload_ingredients">
                <Button
                  size="lg"
                  className="rounded-semi px-6 bg-white text-black hover:bg-white/90 cursor-pointer"
                >
                  Get started
                </Button>
              </Link>

              <Link
                href="https://github.com/binaryshrey/Hungr-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white"
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative rounded-[2.5rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
              <div className="relative overflow-hidden rounded-[2rem]">
                <Image
                  src="/mobile.webp" // replace with your dummy image
                  alt="App preview"
                  width={310}
                  height={620}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
