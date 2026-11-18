import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  size?: "nav" | "display";
}

export function BrandLogo({ href = "/class", size = "nav" }: BrandLogoProps) {
  const isDisplay = size === "display";

  const wordmark = (
    <span
      className={
        isDisplay
          ? "text-[32px] font-extrabold leading-[1.15] tracking-tight sm:text-[40px] lg:text-[48px]"
          : "text-xl font-black leading-none tracking-tight sm:text-2xl"
      }
    >
      <span className={isDisplay ? "font-extrabold text-[#000000]" : "font-extrabold text-gray-900"}>
        Silid
      </span>
      <span
        className={isDisplay ? "font-extrabold text-[#F97316]" : "font-extrabold text-orange-500"}
      >
        LMS
      </span>
    </span>
  );

  if (!href) {
    return wordmark;
  }

  return (
    <Link
      href={href}
      className="group flex shrink-0 items-center gap-2.5 no-underline transition-transform duration-200 hover:scale-[1.02]"
    >
      {wordmark}
    </Link>
  );
}
