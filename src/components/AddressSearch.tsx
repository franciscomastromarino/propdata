"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddressSearch({
  placeholder = "Ingresa una direccion en CABA o GBA...",
  redirectTo = "/cuanto-vale",
}: {
  placeholder?: string;
  redirectTo?: string;
}) {
  const [address, setAddress] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    router.push(`${redirectTo}?address=${encodeURIComponent(address.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-accent hover:bg-accent-light text-white font-medium rounded-xl transition-colors whitespace-nowrap"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
