import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 font-sans relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0f_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] pointer-events-none z-0" />

      <div className="relative z-10 text-center space-y-8">
        <span className="text-[10px] font-mono-tech tracking-widest text-zinc-600 flex items-center justify-center gap-2">
          <span className="text-white text-[8px]">●</span> MOCKMATE
        </span>

        <h1 className="text-outline text-[8rem] md:text-[12rem] font-black leading-none select-none">404</h1>

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Page Not Found</h2>
          <p className="text-zinc-600 font-mono-tech tracking-widest text-[9px]">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 rounded-full text-[9px] font-mono-tech tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300"
        >
          ← Return Home
        </Link>
      </div>
    </div>
  );
}
