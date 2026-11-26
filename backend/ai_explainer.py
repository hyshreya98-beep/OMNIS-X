import os
import json

from dotenv import load_dotenv
from google import genai


# Load the API key from backend/.env
load_dotenv(
    os.path.join(os.path.dirname(__file__), ".env")
)


def generate_ai_explanation(incident_data):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return {
            "success": False,
            "message": "Gemini API key is not configured.",
        }

    try:
        client = genai.Client(api_key=api_key)

        prompt = f"""
You are the OMNIS-X institutional incident explanation assistant.

Explain the following validated incident data in simple,
professional language for college administrators.

VALIDATED INCIDENT DATA:
{json.dumps(incident_data, indent=2)}

Your explanation must include:

1. What happened?
2. Which resources are affected?
3. Which students and faculty are affected?
4. Why is the proposed alternative suitable?
5. What should the administrator do next?

IMPORTANT RULES:
- Use only the supplied incident data.
- Do not invent facts, resources, people or impacts.
- Do not create new recovery options.
- Do not approve or execute recovery.
- Clearly state that approval is required.
- If information is missing, say it is not available.
- This is fictional demonstration data.
"""

        response = client.models.generate_content(
model="gemini-3.6-flash",
            contents=prompt,
        )

        explanation = response.text

        if not explanation:
            return {
                "success": False,
                "message": "Gemini returned an empty response.",
            }

        return {
            "success": True,
            "explanation": explanation,
            "ai_model": "gemini-3.6-flash",
            "data_note": "Based on validated fictional demonstration data.",
        }

    except Exception as error:
        return {
            "success": False,
            "message": f"AI explanation failed: {str(error)}",
        }