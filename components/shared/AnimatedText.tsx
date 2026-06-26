"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Tag = "span" | "p" | "h1" | "h2" | "h3" | "h4";

interface AnimatedTextProps {
  children: string;
  tag?: Tag;
  className?: string;
  delay?: number;
}

export function AnimatedText({
  children,
  tag: Tag = "span",
  className,
  delay = 0,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null);

  const words = children.split(" ");

  useGSAP(
    () => {
      const wordEls = containerRef.current?.querySelectorAll<HTMLElement>(
        ".animated-word-inner"
      );
      if (!wordEls?.length) return;

      gsap.set(wordEls, { y: "110%", opacity: 0 });

      gsap.to(wordEls, {
        y: "0%",
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
        delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 88%",
          once: true,
        },
        onComplete() {
          gsap.set(wordEls, { clearProps: "will-change" });
        },
      });
    },
    { scope: containerRef }
  );

  return (
    // @ts-expect-error — dynamic tag is valid
    <Tag ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="animated-word-clip inline-block overflow-hidden"
          style={{ verticalAlign: "bottom" }}
        >
          <span
            className="animated-word-inner inline-block"
            style={{ willChange: "transform, opacity" }}
          >
            {word}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
