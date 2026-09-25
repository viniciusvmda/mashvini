from checkout.payment.model import Payment


class PaymentDeclinedError(Exception):
    def __init__(self, payment: Payment) -> None:
        self.payment = payment
        super().__init__(f"Payment for order {payment.order_id} was declined")


class PaymentGatewayError(Exception):
    def __init__(self) -> None:
        super().__init__("Payment gateway error")
