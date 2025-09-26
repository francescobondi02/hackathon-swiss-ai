import os
import json
import random
from pathlib import Path
import openai
import dotenv

dotenv.load_dotenv()
SWISS_API = os.getenv("SWISS_AI_PLATFORM_API_KEY")

# Configurazione Apertus
client = openai.OpenAI(
    api_key=SWISS_API,
    base_url="https://api.swisscom.com/layer/swiss-ai-weeks/apertus-70b/v1",
)

# Percorso della cartella contenente i file txt
TRAIN_FOLDER = "data/train"
TASK_TYPES_FILE = "TASK_TYPES.json"


def get_random_txt_file(folder):
    """Seleziona un file txt casuale dalla cartella specificata."""
    txt_files = list(Path(folder).rglob("*.txt"))
    if not txt_files:
        raise FileNotFoundError(f"Nessun file txt trovato nella cartella {folder}")
    return random.choice(txt_files)


def load_task_types(file_path):
    """Carica i task_type definiti nel file JSON."""
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def call_apertus(transcription, task_types):
    """Chiama Apertus per identificare i task_type e compilare i parametri."""

    system_prompt = """Sei un esperto assistente bancario che analizza trascrizioni di chiamate. 
Il tuo compito è:
1. Identificare quali task_type (tra quelli forniti) sono presenti nella trascrizione
2. Per ogni task_type identificato, compilare i parametri quando possibile basandoti sul contenuto della chiamata
3. Restituire SOLO un JSON valido con l'array dei task identificati

Formato di risposta richiesto:
{
  "identified_tasks": [
    {
      "task_type": "nome_del_task",
      "parameters": {
        "param1": "valore_estratto_o_vuoto",
        "param2": "valore_estratto_o_vuoto"
      },
      "confidence": 0.95
    }
  ]
}"""

    user_prompt = f"""Analizza questa trascrizione di una chiamata bancaria e identifica i task_type appropriati:

TRASCRIZIONE:
{transcription}

TASK_TYPE DISPONIBILI:
{json.dumps(task_types, indent=2, ensure_ascii=False)}

Restituisci SOLO il JSON con i task identificati, senza altre spiegazioni."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response = client.chat.completions.create(
        model="swiss-ai/Apertus-70B", messages=messages, stream=False
    )

    return response.choices[0].message.content


def main():
    try:
        # Seleziona un file txt casuale
        txt_file = get_random_txt_file(TRAIN_FOLDER)
        print(f"File selezionato: {txt_file}")

        # Leggi il contenuto del file
        with open(txt_file, "r", encoding="utf-8") as f:
            transcription = f.read()

        print(f"Lunghezza trascrizione: {len(transcription)} caratteri")

        # Carica i task_type
        task_types = load_task_types(TASK_TYPES_FILE)
        print(f"Caricati {len(task_types)} task_types")

        # Chiama Apertus
        print("\nChiamando Apertus...")
        raw_result = call_apertus(transcription, task_types)

        print("\nRisposta raw da Apertus:")
        print("-" * 50)
        print(raw_result)
        print("-" * 50)

        # Tenta di parsare il JSON dalla risposta
        try:
            # Se la risposta contiene codice markdown, estrailo
            if "```json" in raw_result:
                json_start = raw_result.find("```json") + 7
                json_end = raw_result.find("```", json_start)
                json_content = raw_result[json_start:json_end].strip()
            elif "```" in raw_result:
                json_start = raw_result.find("```") + 3
                json_end = raw_result.find("```", json_start)
                json_content = raw_result[json_start:json_end].strip()
            else:
                json_content = raw_result.strip()

            result = json.loads(json_content)

            print("\nRisultato parsato:")
            print(json.dumps(result, indent=4, ensure_ascii=False))

        except json.JSONDecodeError as e:
            print(f"\nErrore nel parsing JSON: {e}")
            print("Risposta raw salvata come stringa")

    except Exception as e:
        print(f"Errore: {e}")


if __name__ == "__main__":
    main()
