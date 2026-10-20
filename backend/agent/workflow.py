# backend/agent/workflow.py
import os
from openai import OpenAI

class AgenticReportGenerator:
    def __init__(self):
        # Requires OPENAI_API_KEY environment variable
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "mock-key"))

    def generate_educational_report(self, prediction: str, confidence: float):
        # If no API key is provided during testing, return a mock response
        if self.client.api_key == "mock-key":
            return {
                "explanation": f"The model predicted {prediction}. In a chest X-ray, this typically presents as increased opacity or consolidation in the lung fields. A confidence score of {confidence*100}% indicates the mathematical probability based on the training data.",
                "limitations": "This is an AI-generated educational analysis. CNNs can be fooled by imaging artifacts, poor exposure, or overlapping structures. This is NOT a medical diagnosis."
            }

        system_prompt = """
        You are an educational medical image analysis assistant.
        CORE RULES:
        1. You are an educational tool, NOT a diagnostic system.
        2. Never invent image findings.
        3. Never prescribe medication.
        4. Clearly state limitations of AI in radiology.
        """

        user_prompt = f"The vision model classified this X-ray as {prediction} with {confidence*100}% confidence. Explain what this condition typically looks like, explain the confidence score, and list the limitations of this AI prediction."

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3
            )
            
            # Simple parsing for demo purposes
            full_text = response.choices[0].message.content
            return {
                "explanation": full_text,
                "limitations": "Please consult a radiologist for clinical decisions."
            }
        except Exception as e:
            return {"explanation": str(e), "limitations": "Error connecting to Agent LLM."}