"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Particle {
	id: number;
	x: number;
	y: number;
	color: string;
	size: number;
	vx: number;
	vy: number;
	life: number; // 0→1 fade out
}

const COLORS = [
	"#d4af37", // gold
	"#c084fc", // purple-400
	"#a78bfa", // violet-400
	"#fbbf24", // amber-400
	"#f0abfc", // fuchsia-300
	"#818cf8", // indigo-400
	"#e879f9", // fuchsia-500
];

let particleId = 0;

/**
 * CursorEffect — Mystical sparkle particles following mouse
 * Rendered on a full-screen canvas overlay
 */
export function CursorEffect() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const particlesRef = useRef<Particle[]>([]);
	const mouseRef = useRef({ x: -100, y: -100 });
	const frameRef = useRef<number>(0);
	const lastSpawnRef = useRef(0);
	const [isClient, setIsClient] = useState(false);

	// Spawn particles on mouse move
	const spawnParticles = useCallback((x: number, y: number, count = 2) => {
		const now = Date.now();
		if (now - lastSpawnRef.current < 30) return; // throttle
		lastSpawnRef.current = now;

		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * 1.5 + 0.5;
			particlesRef.current.push({
				id: particleId++,
				x: x + (Math.random() - 0.5) * 8,
				y: y + (Math.random() - 0.5) * 8,
				color: COLORS[Math.floor(Math.random() * COLORS.length)],
				size: Math.random() * 3 + 1.5,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed - 0.5, // slight upward drift
				life: 1,
			});
		}
		// Cap total particles
		if (particlesRef.current.length > 80) {
			particlesRef.current = particlesRef.current.slice(-80);
		}
	}, []);

	// Click burst
	const spawnClickBurst = useCallback((x: number, y: number) => {
		for (let i = 0; i < 12; i++) {
			const angle = (i / 12) * Math.PI * 2;
			const speed = Math.random() * 3 + 2;
			particlesRef.current.push({
				id: particleId++,
				x,
				y,
				color: COLORS[Math.floor(Math.random() * COLORS.length)],
				size: Math.random() * 4 + 2,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: 1,
			});
		}
	}, []);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (!isClient) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Size canvas to window
		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resize();
		window.addEventListener("resize", resize);

		// Mouse events
		const onMouseMove = (e: MouseEvent) => {
			mouseRef.current = { x: e.clientX, y: e.clientY };
			spawnParticles(e.clientX, e.clientY, 2);
		};
		const onMouseClick = (e: MouseEvent) => {
			spawnClickBurst(e.clientX, e.clientY);
		};
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("click", onMouseClick);

		// Animation loop
		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw cursor glow
			const { x, y } = mouseRef.current;
			const gradient = ctx.createRadialGradient(x, y, 0, x, y, 14);
			gradient.addColorStop(0, "rgba(212, 175, 55, 0.25)");
			gradient.addColorStop(1, "rgba(192, 132, 252, 0)");
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(x, y, 14, 0, Math.PI * 2);
			ctx.fill();

			// Update and draw particles
			particlesRef.current = particlesRef.current.filter((p) => p.life > 0.01);

			for (const p of particlesRef.current) {
				p.x += p.vx;
				p.y += p.vy;
				p.vy += 0.05; // gravity
				p.life -= 0.025;
				p.size *= 0.98;

				ctx.save();
				ctx.globalAlpha = p.life;
				ctx.fillStyle = p.color;
				ctx.shadowBlur = 6;
				ctx.shadowColor = p.color;

				// Draw star shape for larger particles, circle for smaller
				if (p.size > 3) {
					ctx.beginPath();
					const s = p.size;
					ctx.moveTo(p.x, p.y - s);
					ctx.lineTo(p.x + s * 0.3, p.y - s * 0.3);
					ctx.lineTo(p.x + s, p.y);
					ctx.lineTo(p.x + s * 0.3, p.y + s * 0.3);
					ctx.lineTo(p.x, p.y + s);
					ctx.lineTo(p.x - s * 0.3, p.y + s * 0.3);
					ctx.lineTo(p.x - s, p.y);
					ctx.lineTo(p.x - s * 0.3, p.y - s * 0.3);
					ctx.closePath();
					ctx.fill();
				} else {
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.restore();
			}

			frameRef.current = requestAnimationFrame(animate);
		};

		frameRef.current = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(frameRef.current);
			window.removeEventListener("resize", resize);
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("click", onMouseClick);
		};
	}, [isClient, spawnParticles, spawnClickBurst]);

	if (!isClient) return null;

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none fixed inset-0 z-[9999]"
			style={{ mixBlendMode: "screen" }}
			aria-hidden="true"
		/>
	);
}
