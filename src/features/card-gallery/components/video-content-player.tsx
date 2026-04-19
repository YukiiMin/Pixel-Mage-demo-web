"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { CardContent } from "../types";

interface VideoContentPlayerProps {
	content: CardContent;
}

export function VideoContentPlayer({ content }: VideoContentPlayerProps) {
	const [isPlaying, setIsPlaying] = React.useState(false);
	const videoRef = React.useRef<HTMLVideoElement>(null);

	const togglePlay = () => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause();
			} else {
				videoRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
			animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
			transition={{ duration: 0.8, ease: "easeOut" }}
			className="relative group w-full aspect-video rounded-xl overflow-hidden glass-card"
		>
			{/* Shimmer Border Overlay */}
			<div className="absolute inset-0 pointer-events-none z-10 border border-white/10 rounded-xl" />
			<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-shimmer" />

			<video
				ref={videoRef}
				src={content.contentUrl}
				poster={content.thumbnailUrl}
				className="w-full h-full object-cover"
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
				controls={isPlaying}
			/>

			{!isPlaying && (
				<div
					className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-all duration-500 hover:bg-black/20"
					onClick={togglePlay}
				>
					<motion.div
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-md relative"
					>
						{/* Animated Rings */}
						<div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-20" />
						<Play className="w-8 h-8 text-primary fill-primary ml-1" />
					</motion.div>

					<div className="absolute bottom-8 left-0 right-0 text-center">
						<h3 className="text-mystic-gradient text-2xl animate-flicker uppercase tracking-widest font-heading">
							{content.title || "Khởi động linh hồn"}
						</h3>
					</div>
				</div>
			)}

			{/* Info Overlay on Hover */}
			<div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
				<div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-[10px] text-primary uppercase tracking-widest font-bold backdrop-blur-md">
					Tâm Điểm Linh Hồn
				</div>
			</div>
		</motion.div>
	);
}

