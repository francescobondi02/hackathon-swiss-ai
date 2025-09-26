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
    with open("template.json", "r", encoding="utf-8") as f:
        template = json.load(f)

    prompt = f"""You are a helpful assistant that has to analyze the following phone call transcription between a customer and a bank operator.

TRANSCRIPTION:
{transcription_content}

Your mission is to extract the most relevant and important information from this bank call transcription and structure it according to the JSON template provided below. Fill in the placeholders with actual information from the call, or leave them as placeholders if the information is not available.

Please be careful to the following points:
1. Customer problems or requests
2. Solutions proposed by the operator and tasks to be done
3. Any follow-up actions needed

Follow this JSON structure exactly:

{json.dumps(template, indent=2, ensure_ascii=False)}

Return only valid JSON following this structure. Use English for any text fields. If some information is not available, leave null."""

    return prompt


def main():
    try:
        # Seleziona un file txt casuale
        txt_file = get_random_txt_file(TRAIN_FOLDER)
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
        output_file = "gemini_output.json"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(response.text)
        print(f"Risposta salvata in {output_file}")
    except Exception as e:
        print(f"Errore: {e}")


if __name__ == "__main__":
    main()
