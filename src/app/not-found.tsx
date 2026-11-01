import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0c0d10] text-white flex flex-col justify-center items-center px-4 py-16 selection:bg-white selection:text-black">
      <div className="w-full max-w-md space-y-6 text-center">
        <Badge variant="neutral" className="text-[10px] font-mono tracking-widest uppercase py-1 px-3">HTTP 404</Badge>
        <div className="relative mx-auto h-24 w-24 rounded-[5px] bg-[#14161d] border border-[#262a35] flex items-center justify-center text-neutral-400 shadow-2xl">
          <Compass size={44} className="text-[#cbd0dc]" />
        </div>

        {/* Heading & Context */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Page not found
          </h1>
          <p className="text-xs text-[#8d929d] max-w-md mx-auto leading-relaxed">
            This page may have moved, been removed, or the link may be incorrect.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/"
            className="p-3.5 rounded-[5px] border border-[#23262d] bg-[#131519] hover:bg-[#181a20] hover:border-[#343846] transition-all group flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-3">
              <Home size={15} /><span className="text-xs font-semibold text-white">Go to home</span>
            </div>
          </Link>

          <Link
            href="/"
            className="p-3.5 rounded-[5px] border border-[#23262d] bg-[#131519] hover:bg-[#181a20] hover:border-[#343846] transition-all group flex items-center justify-center gap-2"
          >
            <ArrowLeft size={15} /><span className="text-xs font-semibold text-white">Return home</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

