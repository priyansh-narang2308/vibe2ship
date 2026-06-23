from abc import ABC, abstractmethod
from typing import Callable, Awaitable, Optional, Any
import logging

# Type alias for log callbacks
# (agent_name, log_message, status_level) -> Awaitable[None]
# status_level can be: "INFO", "SUCCESS", "WARNING", "ERROR"
LogCallback = Callable[[str, str, str], Awaitable[None]]

class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"app.agents.{self.name}")

    async def log(self, message: str, status: str = "INFO", callback: Optional[LogCallback] = None):
        """Log a message locally and trigger the streaming callback if provided."""
        log_msg = f"[{self.name}] {message}"
        if status == "ERROR":
            self.logger.error(log_msg)
        elif status == "WARNING":
            self.logger.warning(log_msg)
        else:
            self.logger.info(log_msg)

        if callback:
            try:
                await callback(self.name, message, status)
            except Exception as e:
                self.logger.error(f"Failed to execute log callback: {e}")

    @abstractmethod
    async def run(self, *args, log_callback: Optional[LogCallback] = None, **kwargs) -> Any:
        """Execute the agent logic. Must be overridden by subclasses."""
        pass
