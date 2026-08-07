from abc import ABC, abstractmethod


class TokenStore(ABC):
    @abstractmethod
    async def store_refresh(self, jti: str, user_id: str, ttl_seconds: int) -> None: ...

    @abstractmethod
    async def revoke_refresh(self, jti: str) -> None: ...
