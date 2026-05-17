"use client";

import React, { useEffect, useRef } from "react";

type AntigravityCanvasProps = {
  activeColor?: string; // e.g., neon cyan
  secondaryColor?: string; // e.g., neon purple
};

export function AntigravityCanvas({
  activeColor = "0, 168, 107", // Emerald Green rgb
  secondaryColor = "15, 23, 42", // Slate rgb
}: AntigravityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, isActive: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let lastFrameTime = 0;
    let isDocumentVisible = true;
    let isContainerVisible = true;

    // Detect capabilities
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    const maxConnectionDistance = isMobile ? 110 : 150;
    const maxConnectionDistanceSq = maxConnectionDistance * maxConnectionDistance;
    const maxDepthDistance = isMobile ? 100 : 130;

    const resizeCanvas = () => {
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse listeners
    let lastMouseUpdate = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseUpdate > 16) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          isActive: true,
        };
        lastMouseUpdate = now;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
          isActive: true,
        };
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState === "visible";
    };

    // Intersection observer to only animate when visible on screen (performance optimization)
    const observer = new IntersectionObserver(
      ([entry]) => {
        isContainerVisible = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    observer.observe(container);

    canvas.addEventListener("mousemove", handleMouseMove, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchend", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Particle Class simulating 3D gravity-defying physics
    class Particle {
      x: number;
      y: number;
      z: number; // Depth dimension (100 to 600)
      vx: number;
      vy: number;
      vz: number;
      baseRadius: number;
      radius: number;
      energy: number; // Interactive hover energy
      colorType: number; // 0 for cyan, 1 for purple

      constructor() {
        this.x = Math.random() * (canvas?.width || 800);
        this.y = Math.random() * (canvas?.height || 600);
        this.z = Math.random() * 500 + 100;
        this.vx = (Math.random() - 0.5) * 0.4;
        // Float upwards slightly to defy gravity ("Antigravity" effect)
        this.vy = -0.15 - Math.random() * 0.3;
        this.vz = (Math.random() - 0.5) * 0.2;
        this.baseRadius = Math.random() * 1.5 + 0.8;
        this.radius = this.baseRadius;
        this.energy = 0;
        this.colorType = Math.random() > 0.35 ? 0 : 1; // 65% cyan, 35% purple
      }

      update() {
        if (!canvas) return;

        // Gravity-defying floating drift
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // If particle floats past the top, wrap it around to the bottom
        if (this.y < -10) {
          this.y = canvas.height + 10;
          this.x = Math.random() * canvas.width;
        }

        // Bouncing horizontally or depth-wise
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.z < 100 || this.z > 600) this.vz *= -1;

        // Mouse interaction: gravity-defying repulsion
        if (mouseRef.current.isActive) {
          const dx = this.x - mouseRef.current.x;
          const dy = this.y - mouseRef.current.y;
          const distanceSq = dx * dx + dy * dy;
          const maxDistance = 160;
          const maxDistanceSq = maxDistance * maxDistance;

          if (distanceSq < maxDistanceSq && distanceSq > 0) {
            const distance = Math.sqrt(distanceSq);
            // Push away force
            const force = (1 - distance / maxDistance) * 3;
            
            // Defy gravity: push more dynamically
            this.vx += (dx / distance) * force * 0.15;
            this.vy += (dy / distance) * force * 0.15 - 0.05; // extra upward boost
            this.energy = Math.max(this.energy, force * 6);
          }
        }

        // Kinetic Chain reaction: transfer energy to nearby particles
        if (this.energy > 0.1) {
          for (let i = 0; i < particles.length; i++) {
            const other = particles[i];
            if (other === this) continue;
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < 6400 && distSq > 0) { // 80px range
              const distance = Math.sqrt(distSq);
              const energyTransfer = this.energy * 0.25 * (1 - distance / 80);
              
              other.vx += (dx / distance) * energyTransfer * 0.04;
              other.vy += (dy / distance) * energyTransfer * 0.04;
              other.energy = Math.max(other.energy, energyTransfer * 0.6);
            }
          }
          this.energy *= 0.94; // slow decay
        }

        // Damping velocities
        this.vx *= 0.97;
        this.vy = this.vy * 0.98 + ( -0.15 - Math.random() * 0.05 ) * 0.02; // constant gentle lift
        this.vz *= 0.97;

        // Depth perspective scale
        const scale = 300 / this.z;
        this.radius = this.baseRadius * scale * (1 + this.energy * 0.15);
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        const depthOpacity = (600 - this.z) / 500; // closer = brighter
        const baseColor = this.colorType === 0 ? activeColor : secondaryColor;
        const opacity = 0.12 * depthOpacity * (1 + this.energy * 0.5);

        ctx.fillStyle = `rgba(${baseColor}, ${opacity})`;
        ctx.fill();

        // Glowing node effect on hover/energy trigger
        if (this.energy > 0.15) {
          ctx.shadowBlur = 10 * this.energy;
          ctx.shadowColor = `rgba(${baseColor}, 0.8)`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Set particle density based on screen size
    const particleCount = prefersReducedMotion
      ? 15
      : Math.min(
          Math.floor((canvas.width * canvas.height) / (isMobile ? 22000 : 16000)),
          isMobile ? 30 : 65
        );

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = (timestamp = 0) => {
      if (!canvas || !ctx) return;

      if (!isDocumentVisible || !isContainerVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Cap at ~60fps
      if (timestamp - lastFrameTime < 16) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background space grids (very subtle)
      ctx.strokeStyle = "rgba(15, 23, 42, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      // Render 3D Neural Connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = Math.abs(p1.z - p2.z);
          const distSq = dx * dx + dy * dy;

          // Connect particles at similar depth and close proximity
          if (distSq < maxConnectionDistanceSq && dz < maxDepthDistance) {
            const distance = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            const avgDepth = (p1.z + p2.z) / 2;
            const depthOpacity = (600 - avgDepth) / 500;
            const opacity = (1 - distance / maxConnectionDistance) * 0.08 * depthOpacity;

            // Gradient line between the two particle colors
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            const color1 = p1.colorType === 0 ? activeColor : secondaryColor;
            const color2 = p2.colorType === 0 ? activeColor : secondaryColor;

            grad.addColorStop(0, `rgba(${color1}, ${opacity})`);
            grad.addColorStop(1, `rgba(${color2}, ${opacity})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchend", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeColor, secondaryColor]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
        style={{ display: "block" }}
      />
    </div>
  );
}
