import { useLocation, useNavigate } from "react-router";
import { MashviniLogo } from "@/brand/MashviniLogo";
import { useCountdown } from "@/order/useCountdown";
import { Button } from "@/ui/button";

const RETURN_COUNTDOWN_SECONDS = 10;

function SuccessScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = (location.state as { orderId?: number } | null)?.orderId;
  const { remaining } = useCountdown(RETURN_COUNTDOWN_SECONDS, () =>
    navigate("/"),
  );

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 p-8 text-center">
      <MashviniLogo className="w-56 text-header" />
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold">
          Thank you for buying at MashVini
        </h1>
        {orderId !== undefined && (
          <p className="text-lg font-medium">Order #{orderId}</p>
        )}
        <p className="text-lg text-muted-foreground">
          Looking forward to see you again
        </p>
      </div>
      <p aria-live="polite" className="text-base">
        Returning to the start page in {remaining} seconds
      </p>
      <Button type="button" size="lg" onClick={() => navigate("/")}>
        Start new shop
      </Button>
    </div>
  );
}

export { SuccessScreen };
