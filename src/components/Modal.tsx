"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, onClose, children }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-[#fcfcfb] dark:bg-[#1a1a19] p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0b0b0b] dark:text-[#ffffff]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#898781] hover:text-[#0b0b0b] dark:hover:text-[#ffffff]"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
