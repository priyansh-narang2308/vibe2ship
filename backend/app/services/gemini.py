import google.generativeai as genai
from app.core.config import settings
from typing import Type, Optional, Any, Union
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

async def generate_text(
    prompt: Union[str, list],
    use_pro: bool = False,
    system_instruction: Optional[str] = None
) -> str:
    """Generate plain text from Gemini."""
    model_name = 'gemini-1.5-pro' if use_pro else 'gemini-1.5-flash'
    model = genai.GenerativeModel(
        model_name,
        system_instruction=system_instruction
    )
    
    response = model.generate_content(prompt)
    return response.text

async def generate_structured(
    prompt: Union[str, list],
    response_schema: Type[BaseModel],
    use_pro: bool = True,
    system_instruction: Optional[str] = None
) -> BaseModel:
    """Generate structured output validated against a Pydantic schema."""
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
    
    # Parse and return as Pydantic model
    return response_schema.model_validate_json(response.text)
