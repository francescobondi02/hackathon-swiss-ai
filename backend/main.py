from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI()

# Allow all origins for simplicity during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummaryRequest(BaseModel):
    conversationId: int

@app.get("/api/random")
def get_random_number():
    return {"value": random.randint(1, 100)}

@app.post("/api/generate-summary")
def generate_summary(request: SummaryRequest):
    # Mock summary generation - in real app, this would call an AI service
    sample_summaries = {
        1: "Client Mario Rossi called regarding credit card limit increase. He confirmed his personal details (DOB: 15.03.1985, Address: Bahnhofstrasse 45, Zürich) and requested to increase his daily limit from 1000 CHF to 2000 CHF. The request was approved and will be processed within 24 hours.",
        2: "Previous conversation summary about account setup and initial verification process."
    }
    
    return {
        "summary": sample_summaries.get(request.conversationId, "Summary not available for this conversation.")
    }

