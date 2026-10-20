"use client";

// Perspective tunnel hero, adapted from the supplied component.
// Changes: cards are data-driven (`items`) and link somewhere instead of showing
// stock images, so no remote assets are loaded; copy is configurable; touch drag
// and arrow keys drive the tunnel as well as the wheel.

import {
    motion,
    useTransform,
    useReducedMotion,
    useMotionValue,
    useSpring,
    MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

export interface TunnelItem {
    id: string;
    title: string;
    caption: string;
    to: string;
    icon?: ReactNode;
    /** Hue 0-360 for the card's tint. */
    hue?: number;
}

interface TunnelCardData {
    item: TunnelItem;
    angleCos: number;
    angleSin: number;
    radiusFactorX: number;
    radiusFactorY: number;
    rotationZ: number;
    index: number;
}

function buildCards(items: TunnelItem[]): TunnelCardData[] {
    return items.map((item, i) => {
        const goldenAngle = i * 137.5 * (Math.PI / 180);
        return {
            item,
            angleCos: Math.cos(goldenAngle),
            angleSin: Math.sin(goldenAngle),
            radiusFactorX: 0.28 + (i % 3) * 0.08,
            radiusFactorY: 0.26 + (i % 2) * 0.09,
            rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
            index: i,
        };
    });
}

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

interface StageDimensions {
    width: number;
    height: number;
    isMobile: boolean;
}

function useCameraParallax(enabled: boolean) {
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const x = useSpring(rawX, SPRING_CONFIG);
    const y = useSpring(rawY, SPRING_CONFIG);

    useEffect(() => {
        if (!enabled) return;
        const onMove = (e: PointerEvent) => {
            rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
            rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, [enabled, rawX, rawY]);

    return { x, y };
}

interface TunnelCardProps {
    card: TunnelCardData;
    progress: MotionValue<number>;
    pointer: { x: MotionValue<number>; y: MotionValue<number> };
    total: number;
    stage: StageDimensions;
}

function TunnelCard({ card, progress, pointer, total, stage }: TunnelCardProps) {
    const staggerSpan = 0.55;
    const start = (card.index / total) * (1 - staggerSpan);
    const end = start + staggerSpan;

    const localProgress = useTransform(progress, [start, end], [0, 1]);

    const farZ = stage.isMobile ? -1200 : -1700;
    const nearZ = stage.isMobile ? 350 : 500;
    const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

    const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

    const cardWidth = stage.isMobile
        ? Math.max(130, Math.min(180, stage.width * 0.38))
        : Math.max(180, Math.min(270, stage.width * 0.18));

    const baseX = card.angleCos * (stage.width * card.radiusFactorX);
    const baseY = card.angleSin * (stage.height * card.radiusFactorY);
    const panStrength = stage.isMobile ? 20 : 45;

    const transform = useTransform(
        [z, pointer.x, pointer.y],
        ([currZ, px, py]: number[]) => {
            const offsetX = baseX - px * panStrength;
            const offsetY = baseY - py * panStrength;
            return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`;
        }
    );

    const hue = card.item.hue ?? (card.index * 47) % 360;

    return (
        <motion.div
            style={{ width: cardWidth, transform, opacity, zIndex: card.index + 1 }}
            className="pointer-events-auto absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform select-none"
        >
            <Link
                to={card.item.to}
                draggable={false}
                className="group relative block h-full w-full no-underline overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl shadow-black/90 ring-1 ring-white/15 transition-all duration-500 hover:ring-orange-400/80 focus-visible:ring-2 focus-visible:ring-orange-400"
                style={{
                    backgroundImage: `radial-gradient(120% 90% at 30% 10%, hsl(${hue} 45% 28% / 0.9), transparent 60%), linear-gradient(160deg, hsl(${hue} 30% 14%), #0d1116)`,
                }}
            >
                <div className="flex h-full flex-col justify-between p-4 sm:p-5">
                    <div className="text-white/80 transition-transform duration-500 group-hover:scale-110 group-hover:text-orange-300 [&>svg]:h-9 [&>svg]:w-9 sm:[&>svg]:h-11 sm:[&>svg]:w-11">
                        {card.item.icon}
                    </div>
                    <div>
                        <div className="text-base font-semibold leading-tight text-white sm:text-lg">
                            {card.item.title}
                        </div>
                        <p className="mt-1 text-xs leading-snug text-white/65 sm:text-sm">
                            {card.item.caption}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export interface PerspectiveTunnelHeroProps {
    items: TunnelItem[];
    title?: ReactNode;
    kicker?: string;
    hint?: string;
    prompt?: string;
}

export default function PerspectiveTunnelHero({
    items,
    title = (
        <>
            INTO THE
            <br />
            MACHINE.
        </>
    ),
    kicker = "Systems",
    hint = "Scroll, drag or use the arrow keys to fly through the car.",
    prompt = "Scroll to explore",
}: PerspectiveTunnelHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();
    const cards = useRef(buildCards(items)).current;

    const [stage, setStage] = useState<StageDimensions>({ width: 1440, height: 900, isMobile: false });

    useEffect(() => {
        const updateDimensions = () => {
            setStage({
                width: window.innerWidth,
                height: window.innerHeight,
                isMobile: window.innerWidth < 768,
            });
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const rawProgress = useMotionValue(0);
    const smoothProgress = useSpring(rawProgress, { stiffness: 80, damping: 30, restDelta: 0.0001 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const nudge = (d: number) => rawProgress.set(Math.min(1, Math.max(0, rawProgress.get() + d)));

        const onWheel = (e: WheelEvent) => { e.preventDefault(); nudge(e.deltaY * 0.0008); };
        let lastY: number | null = null;
        const onTouchStart = (e: TouchEvent) => { lastY = e.touches[0].clientY; };
        const onTouchMove = (e: TouchEvent) => {
            if (lastY === null) return;
            const y = e.touches[0].clientY;
            nudge((lastY - y) * 0.002);
            lastY = y;
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") nudge(0.06);
            if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") nudge(-0.06);
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("keydown", onKey);
        return () => {
            el.removeEventListener("wheel", onWheel);
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("keydown", onKey);
        };
    }, [rawProgress]);

    const pointer = useCameraParallax(!reduce);

    const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.7, 1, 1.35]);
    const titleOpacity = useTransform(smoothProgress, [0, 0.12, 0.85, 1], [0.25, 1, 1, 0]);
    const promptOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);

    return (
        <div
            ref={containerRef}
            className="relative h-[100svh] w-screen select-none overflow-hidden bg-neutral-950 text-white flex items-center justify-center"
            style={{ perspective: stage.isMobile ? "900px" : "1200px", transformStyle: "preserve-3d", touchAction: "none" }}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2a3340_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] opacity-70" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,122,47,0.12)_0%,transparent_70%)]" />

            <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-orange-400/10" />
            <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-white/10" />

            <motion.div
                style={{ scale: titleScale, opacity: titleOpacity }}
                className="pointer-events-none z-0 flex max-w-xl flex-col items-center px-6 text-center"
            >
                <p className="mb-4 text-sm text-orange-300">{kicker}</p>
                <h1 className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-5xl font-bold leading-[0.9] tracking-tighter text-transparent sm:text-7xl md:text-8xl">
                    {title}
                </h1>
                <p className="mt-4 max-w-[36ch] text-sm font-light text-neutral-400 sm:text-base">{hint}</p>
            </motion.div>

            <motion.div
                style={{ opacity: promptOpacity }}
                className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-sm text-neutral-400"
            >
                <span>{prompt}</span>
                <div className="h-6 w-px bg-gradient-to-b from-orange-400 to-transparent" />
            </motion.div>

            <div className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                {cards.map((card) => (
                    <TunnelCard
                        key={card.item.id}
                        card={card}
                        progress={smoothProgress}
                        pointer={pointer}
                        total={cards.length}
                        stage={stage}
                    />
                ))}
            </div>
        </div>
    );
}
