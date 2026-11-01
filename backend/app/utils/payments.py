from decimal import Decimal

def calculate_service_fee(amount: Decimal, percent: float) -> Decimal:
    return (amount * Decimal(percent)) / Decimal(100)

def create_payment_intent(amount: Decimal, currency: str = "zmw", payment_method: str = "card"):
    # Mock for demonstration. Replace with Stripe/PayPal integration.
    return {
        "id": f"mock_pi_{int(datetime.now().timestamp())}",
        "status": "requires_confirmation",
        "client_secret": f"mock_secret_{int(datetime.now().timestamp())}",
        "amount": amount,
        "currency": currency
    }

def verify_payment(payment_intent_id: str):
    # Mock verification
    return {"status": "succeeded", "payment_intent": payment_intent_id}