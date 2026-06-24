import asyncio
import google.generativeai as genai
from app.core.config import settings
from typing import Type, Optional, Union
from pydantic import BaseModel

# Initialize Gemini SDK
def initialize_gemini():
    try:
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            print("Gemini SDK initialized successfully.")
        else:
            print("WARNING: GEMINI_API_KEY is not set.")
    except Exception as e:
        print(f"WARNING: Error initializing Gemini SDK: {e}")

# Call init
initialize_gemini()

def get_pro_model():
    return genai.GenerativeModel('gemini-1.5-pro')

def get_flash_model():
    return genai.GenerativeModel('gemini-1.5-flash')

def _generate_text_sync(
    prompt: Union[str, list],
    use_pro: bool = False,
    system_instruction: Optional[str] = None
) -> str:
    """Synchronous text generation — run in thread pool."""
    model_name = 'gemini-1.5-pro' if use_pro else 'gemini-1.5-flash'
    model = genai.GenerativeModel(
        model_name,
        system_instruction=system_instruction
    )
    response = model.generate_content(prompt)
    return response.text

def _generate_structured_sync(
    prompt: Union[str, list],
    response_schema: Type[BaseModel],
    use_pro: bool = True,
    system_instruction: Optional[str] = None
) -> BaseModel:
    """Synchronous structured generation — run in thread pool."""
    model_name = 'gemini-1.5-pro' if use_pro else 'gemini-1.5-flash'
    model = genai.GenerativeModel(
        model_name,
        system_instruction=system_instruction
    )
    config = genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=response_schema
    )
    response = model.generate_content(prompt, generation_config=config)
    return response_schema.model_validate_json(response.text)

async def generate_text(
    prompt: Union[str, list],
    use_pro: bool = False,
    system_instruction: Optional[str] = None
) -> str:
    """Generate plain text from Gemini (non-blocking)."""
    return await asyncio.to_thread(
        _generate_text_sync, prompt, use_pro, system_instruction
    )

async def generate_structured(
    prompt: Union[str, list],
    response_schema: Type[BaseModel],
    use_pro: bool = True,
    system_instruction: Optional[str] = None
) -> BaseModel:
    """Generate structured output validated against a Pydantic schema (non-blocking)."""
    return await asyncio.to_thread(
        _generate_structured_sync, prompt, response_schema, use_pro, system_instruction
    )
