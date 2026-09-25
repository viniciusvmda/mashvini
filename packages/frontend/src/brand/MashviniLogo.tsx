import StackedLogo from "./mashvini-logo.svg?react";
import HorizontalLogo from "./mashvini-logo-horizontal.svg?react";

type MashviniLogoProps = {
  layout?: "stacked" | "horizontal";
  className?: string;
};

function MashviniLogo({ layout = "stacked", className }: MashviniLogoProps) {
  const Logo = layout === "horizontal" ? HorizontalLogo : StackedLogo;

  return <Logo role="img" aria-label="Mashvini" className={className} />;
}

export { MashviniLogo };
