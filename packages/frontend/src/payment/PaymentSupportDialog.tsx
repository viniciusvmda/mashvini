import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";

const SUPPORT_PHONE_NUMBER = "9999-999-9999";

type PaymentSupportDialogProps = {
  open: boolean;
  onClose: () => void;
};

function PaymentSupportDialog({ open, onClose }: PaymentSupportDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <AlertDialogContent className="gap-5 p-6 data-[size=default]:max-w-md data-[size=default]:sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold">
            Need help paying?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            We noticed a few failed attempts. Call support at{" "}
            {SUPPORT_PHONE_NUMBER} for help.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            type="button"
            className="h-12 px-6 text-base"
            onClick={onClose}
          >
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { PaymentSupportDialog };
