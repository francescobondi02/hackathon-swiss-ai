#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
import os
from pathlib import Path
from collections import Counter, defaultdict

# Config
ROOT_DIRS = ["data/train", "data/validation", "data/test"]
MAX_EXAMPLES_PER_PARAM = 20
NUM_MAX = 20
VALID_EXT = {".json"}


def iter_json_files(root_dirs):
    for d in root_dirs:
        p = Path(d)
        if not p.exists():
            continue
        for fp in p.rglob("*.json"):
            if fp.suffix.lower() in VALID_EXT:
                yield fp


def load_json_list(fp: Path):
    """
    Carica un file JSON che dovrebbe contenere una lista di task.
    Restituisce [] se non è una lista valida.
    """
    try:
        with fp.open("r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
        # In rari casi i file potrebbero contenere un oggetto con una chiave che ha la lista
        # (ad es. {"tasks":[...]}) — se vuoi, abilita questa euristica:
        if isinstance(data, dict):
            # prova a trovare la prima lista dentro
            for v in data.values():
                if isinstance(v, list):
                    return v
        return []
    except Exception as e:
        print(f"[WARN] Impossibile leggere {fp}: {e}", file=sys.stderr)
        return []


def normalize_value_for_example(v):
    """
    Normalizza un valore per mostrarlo come esempio compatto.
    - Stringhe lunghe o URL: troncate
    - Liste: indicazione della lunghezza + anteprima primi elementi scalari
    - Dizionari: elenco chiavi
    """

    def truncate(s, n=120):
        s = str(s)
        return s if len(s) <= n else s[:n] + "…"

    if isinstance(v, (int, float, bool)) or v is None:
        return v
    if isinstance(v, str):
        return truncate(v)
    if isinstance(v, list):
        # estrai fino a 3 elementi semplici come anteprima
        preview = []
        for it in v[:3]:
            if isinstance(it, (int, float, bool)) or it is None:
                preview.append(it)
            elif isinstance(it, str):
                preview.append(truncate(it, 60))
            elif isinstance(it, dict):
                preview.append(f"dict(keys={list(it.keys())[:5]})")
            else:
                preview.append(type(it).__name__)
        return f"list(len={len(v)}, preview={preview})"
    if isinstance(v, dict):
        return f"dict(keys={list(v.keys())[:10]})"
    return truncate(v)


def main():
    # Aggregatori
    task_type_counts = Counter()  # frequenza task_type
    # param_count[task_type][param_key] -> count
    param_count = defaultdict(Counter)
    # param_examples[task_type][param_key] -> set di esempi (normalizzati)
    param_examples = defaultdict(lambda: defaultdict(set))

    file_count = 0
    task_count = 0

    for fp in iter_json_files(ROOT_DIRS):
        file_count += 1
        tasks = load_json_list(fp)
        for t in tasks:
            if not isinstance(t, dict):
                continue
            tt = t.get("task_type")
            if not isinstance(tt, str):
                continue

            task_type_counts[tt] += 1
            task_count += 1

            params = t.get("parameters", {})
            if isinstance(params, dict):
                for k, v in params.items():
                    param_count[tt][k] += 1
                    if len(param_examples[tt][k]) < MAX_EXAMPLES_PER_PARAM:
                        param_examples[tt][k].add(
                            json.dumps(
                                normalize_value_for_example(v), ensure_ascii=False
                            )
                        )

    # Stampa risultati
    print("=== RIEPILOGO TASK ===")
    print(f"File JSON letti: {file_count}")
    print(f"Task totali:     {task_count}\n")

    print("== Frequenza per task_type ==")
    for tt, cnt in task_type_counts.most_common(NUM_MAX):
        print(f"- {tt}: {cnt}")
    print()

    print("== Parametri per task_type ==")
    for tt, cnt in task_type_counts.most_common(NUM_MAX):
        print(f"\n--- {tt} (n={cnt}) ---")
        if tt not in param_count or not param_count[tt]:
            print("  (Nessun parametro presente)")
            continue

        # ordina parametri per frequenza
        for pk, pcnt in param_count[tt].most_common(NUM_MAX):
            examples = list(param_examples[tt][pk])[:MAX_EXAMPLES_PER_PARAM]
            # json.dumps degli esempi già fatto; ricomponi come lista leggibile
            examples = [json.loads(x) for x in examples]
            print(f"  - {pk}: {pcnt} occorrenze")
            if examples:
                print(f"    esempi: {examples}")

    # Scrivi task_type e parametri associati in un file
    output_file = "task_types.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        for tt in sorted(task_type_counts.keys()):
            f.write(f"{tt}\n")
            if tt in param_count and param_count[tt]:
                for pk, pcnt in param_count[tt].most_common(NUM_MAX):
                    examples = list(param_examples[tt][pk])[:MAX_EXAMPLES_PER_PARAM]
                    examples = [
                        json.loads(x) for x in examples
                    ]  # Decodifica gli esempi
                    f.write(f"  - {pk}: {pcnt} occorrenze\n")
                    if examples:
                        f.write(f"    esempi: {examples}\n")

    print(f"\nTask types e parametri salvati in: {os.path.abspath(output_file)}")

    # Scrivi le contact notes in un file separato
    contact_notes_file = "contact_notes.txt"
    with open(contact_notes_file, "w", encoding="utf-8") as f:
        for fp in iter_json_files(ROOT_DIRS):
            tasks = load_json_list(fp)
            for t in tasks:
                if not isinstance(t, dict):
                    continue
                if t.get("task_type") == "plan_contact":
                    params = t.get("parameters", {})
                    if isinstance(params, dict):
                        contact_note = params.get("contact_note")
                        if isinstance(contact_note, str):
                            f.write(f"{contact_note}\n")

    print(f"\nContact notes salvate in: {os.path.abspath(contact_notes_file)}")
    print("\nFatto.")


if __name__ == "__main__":
    main()
