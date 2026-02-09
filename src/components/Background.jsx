import React from 'react';

const Background = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#EEF2F8]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200/80 via-white to-indigo-200/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.06))]" />
      <div
        className="absolute inset-0
        bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),
            linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)]
        bg-[size:96px_96px]"
      />
      <div className="absolute -top-48 -left-48 w-[640px] h-[640px] bg-blue-400/50 blur-[160px] rounded-full" />
      <div className="absolute top-1/4 -right-48 w-[600px] h-[600px] bg-indigo-400/45 blur-[160px] rounded-full" />
      <div className="absolute bottom-[-200px] left-1/3 w-[520px] h-[520px] bg-sky-300/40 blur-[160px] rounded-full" />
      <div className="relative z-10">
        {children}
      </div>

    </div>
  );
};

export default Background;
