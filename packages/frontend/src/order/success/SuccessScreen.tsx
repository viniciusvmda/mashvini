import { useNavigate } from "react-router";
import { useCountdown } from "@/order/useCountdown";
import { Button } from "@/ui/button";

const RETURN_COUNTDOWN_SECONDS = 10;

function SuccessScreen() {
  const navigate = useNavigate();
  const { remaining } = useCountdown(RETURN_COUNTDOWN_SECONDS, () =>
    navigate("/"),
  );

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold">
          Thank you for buying at MashVini
        </h1>
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
