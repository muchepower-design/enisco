from .auth import router as auth_router
from .travel import router as travel_router
from .insurance import router as insurance_router
from .payments import router as payments_router
from .quotations import router as quotations_router
from .invoices import router as invoices_router
from .webhooks import router as webhooks_router
from .users import router as users_router
from .dashboard import router as dashboard_router

routers = {
    "auth": auth_router,
    "travel": travel_router,
    "insurance": insurance_router,
    "payments": payments_router,
    "quotations": quotations_router,
    "invoices": invoices_router,
    "webhooks": webhooks_router,
    "users": users_router,
    "dashboard": dashboard_router,
}