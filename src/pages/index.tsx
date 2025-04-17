import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

function Laptop() {
  const gltf = useLoader(GLTFLoader, "/3d/laptop.gltf");
  const laptopRef = useRef<THREE.Object3D>(null);
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const action = useRef<THREE.AnimationAction | null>(null);
  const scrollPosition = useRef<number>(0);

  useEffect(() => {
    if (gltf.animations && gltf.animations.length > 0) {
      const firstAnimation = gltf.animations[0];
      if (firstAnimation) {
        mixer.current = new THREE.AnimationMixer(gltf.scene);
        action.current = mixer.current.clipAction(firstAnimation);
        if (action.current) {
          action.current.setLoop(THREE.LoopOnce, 1);
          action.current.clampWhenFinished = true;
          action.current.play();
          action.current.paused = true;
        }
      }
    }
  }, [gltf]);

  interface Position {
    x: number;
    y: number;
    z: number;
  }
  
  interface Rotation {
    x: number;
    y: number;
    z: number;
  }
  
  useEffect(() => {
    const handleScroll = () => {
      scrollPosition.current = window.scrollY;
      const windowHeight = window.innerHeight;
      const totalHeight = windowHeight * 4;
      const scrollProgress = scrollPosition.current / totalHeight;
  
      const positions: Position[] = [
        { x: 3.5, y: -1.25, z: 0 },
        { x: 2.5, y: -1, z: 0 },
        { x: -3.5, y: -1, z: 0 },
        { x: 0, y: -1, z: 0 },
        { x: 0, y: 0, z: 0 },
      ];
  
      const rotations: Rotation[] = [
        { x: 0, y: -Math.PI / 1.25, z: 0 },
        { x: 0, y: -Math.PI / 1, z: 0 },
        { x: 0, y: 0.1, z: 0 },
        { x: 0, y: -Math.PI / 2, z: 0 },
        { x: 0, y: 0, z: 0 },
      ];
  
      const segment = scrollProgress * 4;
      const index = Math.min(Math.floor(segment), positions.length - 2);
      const t = segment - index;
  
      const currentPosition = positions[index];
      const nextPosition = positions[index + 1];
      const currentRotation = rotations[index];
      const nextRotation = rotations[index + 1];
  
      if (currentPosition && nextPosition && currentRotation && nextRotation) {
        const currentPos: Position = {
          x: currentPosition.x + (nextPosition.x - currentPosition.x) * t,
          y: currentPosition.y + (nextPosition.y - currentPosition.y) * t,
          z: currentPosition.z + (nextPosition.z - currentPosition.z) * t,
        };
  
        const currentRot: Rotation = {
          x: currentRotation.x + (nextRotation.x - currentRotation.x) * t,
          y: currentRotation.y + (nextRotation.y - currentRotation.y) * t,
          z: currentRotation.z + (nextRotation.z - currentRotation.z) * t,
        };
  
        if (laptopRef.current) {
          gsap.to(laptopRef.current.position, {
            x: currentPos.x,
            y: currentPos.y,
            z: currentPos.z,
            duration: 0.5,
            ease: "power2.out",
          });
  
          gsap.to(laptopRef.current.rotation, {
            x: currentRot.x,
            y: currentRot.y,
            z: currentRot.z,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      }
  
      if (mixer.current && action.current) {
        const duration = action.current.getClip().duration;
        action.current.time = scrollProgress * duration;
        mixer.current.update(0);
      }
    };
  
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  return (
    <primitive
      ref={laptopRef}
      object={gltf.scene}
      scale={[1.4, 1.4, 1.4]}
      position={[3.5, -1.25, 0]}
      rotation={[0, -Math.PI / 1.25, 0]}
    />
  );
}

function Scene() {
  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "100%",
        height: "100vh",
        overflow: "visible",
        zIndex: 39,
        pointerEvents: "none",
      }}
      camera={{ position: [0, 0, 10], fov: 50 }}
    >
      <ambientLight color={"#ffffff"} intensity={0.8} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={20}
        color={"#ffffff"}
        castShadow
      />
      <hemisphereLight
        color={"#ffffff"}
        groundColor={"#888888"}
        intensity={1}
      />
      <Laptop />
    </Canvas>
  );
}

export default function Home() {
  const [isDesktop, setIsDesktop] = useState(true);
  let lenisRef;

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel : true,
    });
    lenisRef = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    gsap.to("header", {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
    });

    gsap.fromTo(
      ".hero-text",
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top 80%",
        },
      }
    );

    gsap.fromTo(
      ".hero-button",
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "elastic.out(1, 0.5)",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top 60%",
        },
      }
    );

    gsap.fromTo(
      ".feature-item",
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 70%",
        },
      }
    );

    gsap.fromTo(
      ".built-item",
      { x: 50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".built-section",
          start: "top 70%",
        },
      }
    );

    gsap.fromTo(
      ".get-started",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".get-started-section",
          start: "top 80%",
        },
      }
    );

    gsap.to(".hero-section", {
      backgroundPositionY: "20%",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      <Head>
        <title>Session Tracker</title>
        <meta name="description" content="Made by fifly" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="scrollable flex min-h-screen h-[400vh] flex-col items-center justify-start bg-[rgb(30,30,30)] relative w-screen">
        <header className="sticky top-6 w-screen h-10 flex justify-between items-center px-4 sm:px-6 z-50 opacity-0">
          <Link href="" className="flex items-center justify-center h-full">
            <img src="/icon.png" alt="" className="h-full" />
            <h1 className="text-gray-200 text-xl sm:text-2xl font-black">
              Session Tracker
            </h1>
          </Link>
          <Link href="https://github.com/1fifly/session-tracker-app/releases" className="py-2 px-4 border-4 rounded-2xl border-gray-200 text-gray-200 text-base sm:text-lg font-bold cursor-pointer hover:text-[rgb(30,30,30)] hover:bg-gray-200 transition-colors duration-300">
            DOWNLOAD
          </Link>
        </header>
        <section className="hero-section w-screen h-screen flex flex-col items-start justify-start px-4 sm:px-6 py-16 bg-[rgb(30,30,30)]">
          <div className="w-full p-4 sm:p-8 md:p-12 lg:p-20">
            <h2 className="hero-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[10rem] text-gray-200 text-left font-semibold -mb-[1%]">
              Track your time.
            </h2>
            <h3 className="hero-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[10rem] text-gray-200 text-left font-medium">
              Own your day.
            </h3>
            <h4 className="hero-text text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-gray-300 text-left font-light ml-[1%]">
              Boost your productivity.
            </h4>
            <div className="flex flex-col sm:flex-row justify-start items-center gap-4 sm:gap-6 px-[1%] py-[2%] w-full">
              <Link href="https://github.com/1fifly/session-tracker-app/releases" className="hero-button w-full sm:w-auto py-2 px-4 xl:py-4 xl:px-8 border-4 rounded-2xl bg-[#6B5B95] border-[#6B5B95] text-gray-200 text-base sm:text-lg xl:text-2xl font-bold cursor-pointer hover:bg-[#7f6da9] hover:border-[#7f6da9] transition-colors duration-300">
                DOWNLOAD
              </Link>
              <Link href="https://github.com/1fifly/session-tracker-app" className="hero-button w-full sm:w-auto py-2 px-4 xl:py-4 xl:px-8 border-4 rounded-2xl border-gray-200 text-gray-200 text-base sm:text-lg xl:text-2xl font-bold cursor-pointer hover:text-[rgb(30,30,30)] hover:bg-gray-200 transition-colors duration-300">
                LEARN MORE
              </Link>
            </div>
          </div>
          {isDesktop && <Scene />}
        </section>
        <section className="features-section animate-section w-screen h-screen flex flex-col md:flex-row items-center justify-center gap-8 px-4 sm:px-6 lg:px-12 z-40">
          <div className="w-full md:w-1/2 h-full flex flex-col items-start justify-center gap-4">
            <h2 className="feature-item text-3xl sm:text-4xl md:text-5xl xl:text-6xl text-white font-semibold tracking-tight">
              Features
            </h2>
            <p className="feature-item text-lg sm:text-xl md:text-2xl xl:text-3xl text-gray-300 font-light leading-relaxed">
              Simple. Powerful. Built to keep you focused.
            </p>
            <div className="space-y-4 text-gray-400 font-light">
              <div className="feature-item flex items-center gap-3">
                <svg
                  className="w-6 sm:w-8 xl:w-10 h-6 sm:h-8 xl:h-10 text-[#6B5B95]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-base sm:text-lg md:text-xl xl:text-2xl">
                  Instant session start/stop
                </span>
              </div>
              <div className="feature-item flex items-center gap-3">
                <svg
                  className="w-6 sm:w-8 xl:w-10 h-6 sm:h-8 xl:h-10 text-[#6B5B95]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  ></path>
                </svg>
                <span className="text-base sm:text-lg md:text-xl xl:text-2xl">
                  Clear progress charts
                </span>
              </div>
              <div className="feature-item flex items-center gap-3">
                <svg
                  className="w-6 sm:w-8 xl:w-10 h-6 sm:h-8 xl:h-10 text-[#6B5B95]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  ></path>
                </svg>
                <span className="text-base sm:text-lg md:text-xl xl:text-2xl">
                  Custom tags & categories
                </span>
              </div>
              <div className="feature-item flex items-center gap-3">
                <svg
                  className="w-6 sm:w-8 xl:w-10 h-6 sm:h-8 xl:h-10 text-[#6B5B95]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  ></path>
                </svg>
                <span className="text-base sm:text-lg md:text-xl xl:text-2xl">
                  Flexible timers or manual
                </span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-full flex items-center justify-end">
            <div className="relative w-full sm:w-3/4 max-w-md mx-auto md:mx-0"></div>
          </div>
        </section>
        <section className="built-section animate-section w-screen h-screen flex flex-col md:flex-row items-center justify-end gap-8 px-4 sm:px-6 lg:px-12">
          <div className="w-full md:w-1/2 h-full flex flex-col items-start md:items-end justify-center gap-4">
            <h2 className="built-item text-3xl sm:text-4xl md:text-5xl xl:text-6xl text-white font-semibold tracking-tight text-left md:text-right">
              Built For You
            </h2>
            <p className="built-item text-lg sm:text-xl md:text-2xl xl:text-3xl text-gray-300 font-light leading-relaxed text-left md:text-right">
              Your time, your way, no matter who you are.
            </p>
            <div className="space-y-4 text-gray-400 font-light text-left md:text-right">
              <div className="built-item flex items-center gap-3 justify-start md:justify-end">
                <svg
                  className="w-6 sm:w-8 xl:w-10 h-6 sm:h-8 xl:h-10 text-[#6B5B95]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z"
                  ></path>
                </svg>
                <span className="text-base sm:text-lg md:text-xl xl:text-2xl">
                  Students: Nail study sessions
                </span>
              </div>
              <div className="built-item flex items-center gap-3 justify-start md:justify-end">
                <svg
                  className="w-6 sm:w-8 xl:w-10 h-6 sm:h-8 xl:h-10 text-[#6B5B95]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                <span className="text-base sm:text-lg md:text-xl xl:text-2xl">
                  Pros: Streamline work
                </span>
              </div>
              <div className="built-item flex items-center gap-3 justify-start md:justify-end">
                <svg
                  className="w-6 sm:w-8 xl:w-10 h-6 sm:h-8 xl:h-10 text-[#6B5B95]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-base sm:text-lg md:text-xl xl:text-2xl">
                  Freelancers: Track hours
                </span>
              </div>
              <div className="built-item flex items-center gap-3 justify-start md:justify-end">
                <svg
                  className="w-6 sm:w-8 xl:w-10 h-6 sm:h-8 xl:h-10 text-[#6B5B95]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  ></path>
                </svg>
                <span className="text-base sm:text-lg md:text-xl xl:text-2xl">
                  Fitness fans: Log workouts
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="get-started-section animate-section w-screen h-screen flex flex-col items-center justify-end gap-6 pb-16 px-4 sm:px-6">
          <h2 className="get-started text-3xl sm:text-4xl xl:text-5xl text-white font-semibold tracking-tight">
            Get Started Today
          </h2>
          <p className="get-started text-base sm:text-lg xl:text-xl text-gray-300 font-light leading-relaxed text-center max-w-xl">
            Take charge of your time with Session Tracker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="https://github.com/1fifly/session-tracker-app/releases" className="get-started py-4 px-8 xl:py-6 xl:px-12 border-4 rounded-xl bg-[#6B5B95] border-[#6B5B95] text-gray-200 text-lg sm:text-xl xl:text-2xl font-semibold cursor-pointer hover:bg-[#7f6da9] hover:border-[#7f6da9] transition-all duration-300 hover:shadow-lg">
              DOWNLOAD NOW
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}