import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className = "", priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/brand/schoolphotohub-logo.png"
      alt="School Photo Hub"
      width={260}
      height={146}
      className={`h-auto w-44 object-contain ${className}`}
      priority={priority}
    />
  );
}

export function BrandIcon({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand/schoolphotohub-icon.png"
      alt=""
      width={48}
      height={48}
      className={`h-12 w-12 rounded-md object-contain ${className}`}
    />
  );
}
