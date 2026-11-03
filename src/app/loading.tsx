import Image from "next/image";

export default function Loading() {
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-20" role="status" aria-live="polite">
      <div className="relative h-16 w-16">
        <Image src="/brand/logo-mark.png" alt="" fill sizes="64px" priority className="object-contain" />
      </div>
      <p className="type-eyebrow mt-5">Loading Cloud</p>
      <span className="sr-only">Loading the storefront</span>
      <div className="mt-5 h-0.5 w-24 overflow-hidden rounded-full bg-border" aria-hidden>
        <span className="block h-full w-1/3 rounded-full bg-primary" style={{ animation: "loadingBar 900ms var(--ease-ui) infinite" }} />
      </div>
    </div>
  );
}
