"use client";

import Image from "next/image";
import Link from "next/link";
import paypal from "../assets/images/paypal.png";
import stripe from "../assets/images/stripe.png";
import razorpay from "../assets/images/razorpay.png";
import googlepay from "../assets/images/google-pay.png";
import payment from "../assets/images/payment.jpg";
import { useEffect, useState, useRef } from "react";
import AnimatedEarth from "./earth";
import payment2 from "../assets/images/developer.png";
import chandelier from "../assets/images/chandelier.png";
import flower from "../assets/images/flower.png";

const features = [
  "Accept Payments",
  "Make Payouts",
  "Start Business Banking",
  "Automate Payroll",
];

// Predefined positions and sizes for particles to avoid hydration mismatch
const particleData = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  width: 5 + ((i * 7) % 20),
  height: 5 + ((i * 11) % 20),
  top: (i * 1) % 100,
  left: (i * 23) % 100,
  animation: `float${(i % 1) + 1}`,
  duration: 5 + ((i * 1) % 10),
  delay: (i * 20) % 1,
}));

const smoothScrollTo = (element: HTMLElement, duration: number = 2000) => {
  const targetPosition =
    element.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  // Easing function for smooth acceleration and deceleration
  const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  requestAnimationFrame(animation);
};

export default function HomePage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const videoRef = useRef(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    setIsVisible(true);

    return () => {
      clearInterval(interval);
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const onClickGetStarted = () => {
    if (sectionRef.current) {
      smoothScrollTo(sectionRef.current, 500);
    }
    // Set highlight state to true
    setIsHighlighted(true);

    // Remove highlight after 10 seconds
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = setTimeout(() => {
      setIsHighlighted(false);
    }, 10000); // 10 seconds

    // Your existing animation
    const element = document.querySelector(".animated-section");
    if (element) {
      element.classList.add("animate-pulse");
    }
  };

  // Don't render particles during SSR to avoid hydration issues
  const renderParticles = mounted && (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}>
      {particleData.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white/10"
          style={{
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            animation: `${particle.animation} ${particle.duration}s  infinite ease-in-out`,
            animationDelay: `${particle.delay}s`,
          }}></div>
      ))}
    </div>
  );

  return (
    <div
      className="font-sans min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 overflow-hidden relative"
      ref={sectionRef}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-indigo-500 rounded-full filter blur-3xl opacity-15 animate-pulse delay-500"></div>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
      <div className="-top-2 right-0 flex items-center gap-0 rotate-180 h-[50px] w-full overflow-hidden fixed z-999">
        {[...Array(35)].map((_, index) => (
          <div
            key={index}
            className="h-[35px] w-[70px] overflow-hidden flex justify-center">
            <Image
              src={flower}
              alt="flower"
              className="object-contain h-[70px] w-full z-10"
            />
          </div>
        ))}
      </div>
      {/* Video background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          className="w-full h-full object-cover"
          poster="data:image/gif,AAAA">
          <source src="/digital-payment-background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="relative z-10 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-30">
        <div
          className={`flex flex-col items-center gap-2 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}>
          <h1 className="text-5xl md:text-6xl font-bold text-center text-white mb-4">
            {/* <Image src={logo} alt="logo" width={100} height={100} /> */}
            Payment{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              Gateway
            </span>
          </h1>
          <p className="text-blue-100 text-center text-lg max-w-2xl">
            Choose your preferred payment method for seamless transactions
          </p>
        </div>

        <div className="flex flex-col items-center justify-start  gap-10 w-full max-w-6xl !pt-20 min-h-[1290px]">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-white">
            The all-in-one{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 ">
              Finance Platform
            </span>{" "}
            <br />
            you&apos;ve been looking for
          </h1>

          <section
            id="animated-section"
            className={`w-full bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border transition-all duration-500 ${
              isHighlighted
                ? "border-4 border-yellow-400 shadow-lg shadow-yellow-400/50"
                : "border-white/20"
            }`}>
            <div className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
                With Payment Gateway, you can
              </h2>

              <div className="flex flex-col items-center justify-center mb-12">
                {/* Animated feature display */}
                <div className="h-16 md:h-20 overflow-hidden relative w-full max-w-md">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`absolute top-0 left-0 w-full text-center transition-all duration-500 ease-in-out transform ${
                        index === currentFeature
                          ? "translate-y-0 opacity-100"
                          : index < currentFeature
                          ? "-translate-y-full opacity-0"
                          : "translate-y-full opacity-0"
                      }`}>
                      <div className="text-xl md:text-2xl font-semibold text-white bg-blue-500/30 py-3 px-6 rounded-lg backdrop-blur-sm border border-white/20">
                        {feature}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center">
                <Link
                  href="/paypal"
                  className="group flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-blue-500/10">
                  <div className="relative w-28 h-30 mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={paypal}
                      alt="Paypal"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="absolute bottom-5 text-black/80 text-sm group-hover:text-blue-400 hover:text-white duration-300">
                    PayPal
                  </span>
                </Link>

                <Link
                  href="/stripe"
                  className="group flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-purple-500/10">
                  <div className="relative w-28 h-30 mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={stripe}
                      alt="Stripe"
                      fill
                      className="object-contain "
                    />
                  </div>
                  <span className="absolute bottom-5  text-black/80 text-sm  group-hover:text-purple-400 duration-300">
                    Stripe
                  </span>
                </Link>

                <Link
                  href="/razorpay"
                  className="group flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-blue-500/10">
                  <div className="relative w-28 h-30 mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={razorpay}
                      alt="Razorpay"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="absolute bottom-5 text-black/80 text-sm group-hover:text-blue-400  duration-300">
                    Razorpay
                  </span>
                </Link>

                <Link
                  href="/googlepay"
                  className="group flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-green-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-green-500/10">
                  <div className="relative w-28 h-30 mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={googlepay}
                      alt="Google Pay"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="absolute bottom-5 text-black/80 text-sm group-hover:text-green-400  duration-300">
                    Google Pay
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Floating particles animation - only render on client */}
        {/* Floating particles animation - only render on client */}
        {/* <div
          className={`transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}> */}
        {renderParticles}
        {/* </div> */}
      </div>
      <div className="absolute -top-95 left-0 w-full h-full">
        <Image
          src={payment}
          alt="payment"
          fill
          className="object-contain h-full w-full"
        />
      </div>

      <AnimatedEarth />
      <div className="relative flex justify-center items-center bg-blue-300 item-center py-20 w-auto h-fit gap-10">
        <Image
          src={payment2}
          alt="payment"
          className="object-contain h-[400px] w-fit"
        />

        {/* Bulb + Light Glow */}
        <div className="absolute -top-[1%] right-[41%] flex flex-col items-center">
          {/* Bulb image */}
          <Image
            src={chandelier}
            alt="chandelier"
            className="object-contain h-[100px] w-fit z-10"
          />

          {/* Wide round glow below bulb */}
          <div className="w-64 h-64 bg-yellow-100 opacity-60 blur-3xl rounded-full -mt-10 animate-light z-0" />
        </div>

        <div className="flex flex-col justify-center items-start gap-5">
          <h3 className="text-3xl font-bold z-50">Developer</h3>
          <p className="text-black text-xl flex-wrap max-w-2xl">
            Explore developer documentation and resources to help you integrate
            the most popular payment methods into your platform or marketplace.
          </p>
          <button className="animated-button bg-blue-500 hover:bg-blue-700 text-white font-bold text-lg py-4 px-8 rounded-lg cursor-pointer">
            Learn More
          </button>
        </div>
      </div>

      {/* Add CSS for the highlight animation */}

      <div className="text-white text-2xl font-bold w-full flex items-center text-center justify-between bg-white-500/30 py-3 px-6 rounded-lg backdrop-blur-sm border border-white/20 ">
        Supercharge your business with Payment Gateway
        <button
          className="animated-button bg-blue-500/30 py-3 px-6 rounded-lg backdrop-blur-sm border border-white/20 cursor-pointer text-white font-medium relative"
          onClick={onClickGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}
