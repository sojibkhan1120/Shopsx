import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const AmazonBrandLogo: React.FC<LogoProps> = ({ className = '', size = 56 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-2xl overflow-hidden shadow-xs border border-neutral-200/80 bg-white shrink-0 flex flex-col ${className}`}
    >
      {/* Top 36%: White background with amazon wordmark and orange smile */}
      <div className="h-[38%] bg-white flex flex-col items-center justify-center pt-1 px-1 select-none">
        <div className="relative flex flex-col items-center">
          <span className="text-[11px] font-black tracking-tighter text-neutral-900 leading-none">
            amazon
          </span>
          {/* Amazon signature curved arrow smile */}
          <svg className="w-7 h-2 mt-[-1px]" viewBox="0 0 40 10" fill="none">
            <path
              d="M3 3 C15 9, 28 8, 35 3"
              stroke="#ff9900"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M32 1.5 L36 3 L34 5.5 Z"
              fill="#ff9900"
            />
          </svg>
        </div>
      </div>

      {/* Bottom 62%: Deep blue shopping cart */}
      <div className="flex-1 bg-gradient-to-b from-[#184d85] via-[#103b6a] to-[#0c2f57] flex items-center justify-center p-1.5">
        <svg className="w-7 h-7 text-white" viewBox="0 0 32 32" fill="none">
          {/* Shopping cart handle and frame */}
          <path
            d="M4 6 H8 L12 21 H25 L28 10 H9"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Basket inner grid lines */}
          <path
            d="M13 14 H26"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M14 17 H24"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M16 10 V20"
            stroke="white"
            strokeWidth="1.6"
          />
          <path
            d="M21 10 V20"
            stroke="white"
            strokeWidth="1.6"
          />
          {/* Wheels */}
          <circle cx="13" cy="25" r="2.2" fill="white" />
          <circle cx="24" cy="25" r="2.2" fill="white" />
        </svg>
      </div>
    </div>
  );
};

export const AlibabaBrandLogo: React.FC<LogoProps> = ({ className = '', size = 56 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full overflow-hidden shadow-xs border border-orange-300/40 bg-gradient-to-br from-[#ff7e00] via-[#ff6000] to-[#e64a00] shrink-0 flex items-center justify-center select-none ${className}`}
    >
      {/* Top subtle glossy shine arc */}
      <div className="absolute top-1 right-2.5 w-4 h-1.5 bg-white/40 rounded-full rotate-[-20deg] blur-[0.4px]" />

      {/* Alibaba stylized face monogram in white */}
      <svg className="w-9 h-9" viewBox="0 0 44 44" fill="none">
        {/* Forehead, hair sweep and nose/chin profile of Alibaba */}
        <path
          d="M 12 26 C 10 20, 16 11, 26 12 C 28 12.5, 30 14, 30 17 C 30 20, 26 23, 20 23 C 15 23, 13 25, 13 27 C 13 30, 17 32, 23 31 C 28 30, 32 27, 34 25"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dynamic sweeping swoosh line */}
        <path
          d="M 16 28 C 18 29, 21 29.5, 25 28 C 30 26, 34 23, 37 21"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Smiling eye/eyebrow curve */}
        <path
          d="M 21 16 C 22.5 15.2, 24.5 15.5, 25.5 16.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export const AliExpressBrandLogo: React.FC<LogoProps> = ({ className = '', size = 56 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-2xl overflow-hidden shadow-xs border border-red-300/40 bg-gradient-to-b from-[#e52817] via-[#dc1c0b] to-[#c71303] shrink-0 flex flex-col justify-between select-none ${className}`}
    >
      {/* Top orange folded rim/handle base */}
      <div className="h-[20%] bg-[#ff7a00] w-full rounded-t-xl" />

      {/* Center White U-shaped Shopping Bag Handle / Smile */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-1">
        <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
          <path
            d="M 5 3 C 5 15, 27 15, 27 3"
            stroke="white"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </svg>
        {/* AliExpress wordmark */}
        <span className="text-[8.5px] font-black text-white tracking-tight leading-none mt-1">
          AliExpress
        </span>
      </div>
    </div>
  );
};

export const VipBadge: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] bg-gradient-to-r from-[#f7a81b] to-[#f39c12] shadow-2xs ${className}`}
    >
      <span className="text-[10.5px] font-black italic text-white tracking-wider uppercase leading-none drop-shadow-2xs">
        {name}
      </span>
    </span>
  );
};
