from google import genai
import random
from pathlib import Path
import json

# Load the environment variables from the .env file
from dotenv import load_dotenv
import os

load_dotenv()

# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client()

# Configurazione
TRAIN_FOLDER = "data/train"


def get_random_txt_file(folder):
    """Seleziona un file txt casuale dalla cartella specificata."""
    txt_files = list(Path(folder).rglob("*.txt"))
    if not txt_files:
        raise FileNotFoundError(f"Nessun file txt trovato nella cartella {folder}")
    return random.choice(txt_files)


def create_prompt(transcription_content):
    """Crea un prompt personalizzato attorno al contenuto della trascrizione."""

    # Carica il template JSON
    with open("prompts/template.json", "r", encoding="utf-8") as f:
        template = json.load(f)

    prompt = f"""You are a helpful assistant that has to analyze the following phone call transcription between a customer and a bank operator.

TRANSCRIPTION:
{transcription_content}

Your mission is to extract the most relevant and important information from this bank call transcription and structure it according to the JSON template provided below. Fill in the placeholders with actual information from the call, or leave them as placeholders if the information is not available.

Be careful with the following points:

Customer problems or requests

Solutions proposed by the operator and tasks to be done

Any follow-up actions needed

Additional constraints:

duration must always be filled with a reasonable estimated call length, inferred from the transcript.

The field next_meeting in meeting_arrangements must be:

Filled with the scheduled meeting date and time if one was agreed during the call.

Otherwise, filled with the dates/times when the client is available for future contact.

Follow this JSON structure exactly:

{json.dumps(template, indent=2, ensure_ascii=False)}

Return only valid JSON following this structure. Use English for any text fields. If some information is not available, leave null."""

    return prompt


def create_summary_prompt(transcription_content):
    """Crea un prompt per generare il riepilogo della trascrizione."""

    # Carica il template JSON
    with open("prompts/summary.json", "r", encoding="utf-8") as g:
        template = json.load(g)

    prompt = f"""You are analyzing a transcript of a call between a client and a bank advisor.
Instructions:
Write a concise summary of the call.
The summary must not exceed 4 sentences or 200 characters (whichever comes first).
The summary should capture the most important points: client’s request, advisor’s response, and any next steps.
Output the result only as a JSON object in the format below. Use ENglish. Do not include any text outside the JSON.
JSON Output Format:
{{
"call_summary": "..."
}}

Transcript:
{transcription_content}
"""
    return prompt


def main():
    try:
        # Seleziona un file txt casuale
        # txt_file = get_random_txt_file(TRAIN_FOLDER)
        txt_file = Path("example/example.txt")
        print(f"File selezionato: {txt_file}")

        # Leggi il contenuto del file
        with open(txt_file, "r", encoding="utf-8") as f:
            transcription = f.read()

        print(f"Lunghezza trascrizione: {len(transcription)} caratteri")

        # Crea il prompt
        prompt = create_prompt(transcription)

        print("\nChiamando Gemini...")

        # Chiama Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash", contents=prompt
        )

        print("\nRisposta di Gemini:")
        print("-" * 50)
        print(response.text)
        print("-" * 50)

        # Also save the response to a file
        output_file = "results/gemini_output.json"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(response.text)
        print(f"Risposta salvata in {output_file}")

        # Crea il secondo prompt per il riepilogo
        summary_prompt = create_summary_prompt(transcription)

        print("\nChiamando Gemini per il riepilogo...")

        # Chiama Gemini
        summary_response = client.models.generate_content(
            model="gemini-2.5-flash", contents=summary_prompt
        )

        print("\nRiepilogo di Gemini:")
        print("-" * 50)
        print(summary_response.text)
        print("-" * 50)

        # Salva il riepilogo in un altro file
        summary_output_file = "results/gemini_summary_output.json"
        with open(summary_output_file, "w", encoding="utf-8") as f:
            f.write(summary_response.text)
        print(f"Riepilogo salvato in {summary_output_file}")

    except Exception as e:
        print(f"Errore: {e}")


if __name__ == "__main__":
    main()
