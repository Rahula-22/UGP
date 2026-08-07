from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/status")
async def auth_status() -> dict[str, str]:
    return {"status": "M1 scaffold — implement register/login/refresh/logout/me"}
