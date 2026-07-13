"use client";

export function BadgeDemo() {
  return (
    <div className="relative w-full max-w-md">
      {/* Glow effect */}
      <div
        className="absolute -inset-4 rounded-3xl opacity-20 blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
      />

      {/* Laptop frame */}
      <div className="relative bg-gray-900 rounded-2xl p-3 shadow-2xl">
        {/* Screen */}
        <div className="bg-gray-800 rounded-xl overflow-hidden aspect-[4/3]">
          {/* Title bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-700/50">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="ml-2 text-[10px] text-gray-400 font-mono">BadgeGen</span>
          </div>

          {/* Content area */}
          <div className="p-4 flex items-center justify-center h-full">
            <Badge />
          </div>
        </div>

        {/* Laptop base */}
        <div className="h-2 bg-gray-700 rounded-b-xl mx-8" />
        <div className="h-1 bg-gray-600 rounded-b-xl mx-16" />
      </div>

      {/* Floating badge preview */}
      <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-3 border border-gray-100 hidden sm:block">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">PDF généré</p>
            <p className="text-[10px] text-gray-500">15 badges prêts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge() {
  return (
    <div className="relative w-44 h-64 rounded-xl overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)" }}>
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "var(--gradient-primary)" }} />

      {/* Photo placeholder */}
      <div className="mt-6 mx-auto w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden">
        <svg className="w-10 h-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>

      {/* Name */}
      <div className="mt-3 text-center px-3">
        <p className="text-white font-bold text-sm leading-tight">Jean Dupont</p>
        <p className="text-white/60 text-[10px] mt-1">Paris, France</p>
      </div>

      {/* Divider */}
      <div className="mx-4 mt-3 border-t border-white/10" />

      {/* QR placeholder */}
      <div className="mt-3 mx-auto w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-[2px]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-[1px]"
              style={{
                backgroundColor: [0, 1, 3, 4, 5, 7, 9, 11, 12, 14, 15].includes(i)
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Badge code */}
      <p className="mt-2 text-center text-[8px] text-white/30 font-mono tracking-widest">BADGE-0001</p>
    </div>
  );
}
