import os
import openai
import dotenv

dotenv.load_dotenv()
SWISS_API = os.getenv("SWISS_AI_PLATFORM_API_KEY")

client = openai.OpenAI(
    api_key=SWISS_API,
    base_url="https://api.swisscom.com/layer/swiss-ai-weeks/apertus-70b/v1",
)

stream = client.chat.completions.create(
    model="swiss-ai/Apertus-70B",
    messages=[
        {
            "role": "system",
            "content": "You are a travel agent. Be descriptive and helpful",
        },
        {
            "role": "user",
            "content": "What are the best places to visit in Switzerland?",
        },
    ],
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="", flush=True)
