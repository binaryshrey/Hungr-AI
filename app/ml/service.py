import os, json
from pathlib import Path
from typing import Any, Dict, List, Optional

from supabase import create_client, Client


def _load_env_once() -> None:
    """
    Loads .env from project root (two levels above this file) if present.
    Safe to call multiple times.
    """
    try:
        from dotenv import load_dotenv
    except Exception:
        return

    project_root = Path(__file__).resolve().parents[2]  
    env_path = project_root / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=False)


_load_env_once()


SUPABASE_URL_ENV = "SUPABASE_URL"
SUPABASE_KEY_ENV = "SUPABASE_KEY"
SUPABASE_TABLE_ENV = "SUPABASE_RECIPES_TABLE"
DEFAULT_TABLE = "recipes_raw"

_sb: Optional[Client] = None


def _get_supabase_client() -> Client:
    """
    Lazily create Supabase client on first use.
    Also ensures .env is loaded before reading env vars.
    """
    global _sb
    if _sb is not None:
        return _sb

    _load_env_once()

    url = os.getenv(SUPABASE_URL_ENV)
    key = os.getenv(SUPABASE_KEY_ENV)

    if not url or not key:
        cwd = os.getcwd()
        root = Path(__file__).resolve().parents[2]
        env_exists = (root / ".env").exists()
        raise RuntimeError(
            f"Missing {SUPABASE_URL_ENV} or {SUPABASE_KEY_ENV} env vars.\n"
            f"Debug:\n"
            f"- cwd: {cwd}\n"
            f"- expected .env at: {root / '.env'} (exists={env_exists})\n"
            f"- TIP: install python-dotenv and ensure keys are in that .env, or export them in shell."
        )

    _sb = create_client(url, key)
    return _sb


def _recipes_table() -> str:
    _load_env_once()
    return os.getenv(SUPABASE_TABLE_ENV, DEFAULT_TABLE)


def fetch_candidate_recipes(
    detected: List[str],
    limit_per_ingredient: int = 300,
    max_total: int = 2000,
) -> List[Dict[str, Any]]:
    sb = _get_supabase_client()
    table = _recipes_table()

    seen_ids = set()
    candidates: List[Dict[str, Any]] = []

    for ingredient in detected:
        if len(candidates) >= max_total:
            break

        ing = (ingredient or "").strip().lower()
        if not ing:
            continue

        json_filter = json.dumps([ing])

        resp = (
            sb.table(table)
            .select("id,title,ingredients,instructions")
            .contains("ingredients", json_filter)
            .limit(limit_per_ingredient)
            .execute()
        )

        data = resp.data or []
        for r in data:
            rid = r.get("id")
            if rid is None or rid in seen_ids:
                continue
            seen_ids.add(rid)
            candidates.append(r)

            if len(candidates) >= max_total:
                break

    return candidates

def suggest_recipes_from_records(
    detected: List[str],
    records: List[Dict[str, Any]],
    top_n: int = 10,
) -> List[Dict[str, Any]]:
    P = set(d.lower() for d in detected if isinstance(d, str) and d.strip())
    scored: List[Dict[str, Any]] = []

    for r in records:
        ing = r.get("ingredients") or []
        if isinstance(ing, str):
            ing = [ing]

        R = set(x.lower() for x in ing if isinstance(x, str))
        matched = sorted(P & R)
        if not matched:
            continue

        missing = sorted(R - P)
        score = len(matched) / max(len(P), 1)

        scored.append(
            {
                "id": r.get("id"),
                "title": r.get("title", "Untitled"),
                "score": score,
                "matched": matched,
                "missing": missing,
                "instructions": r.get("instructions", ""),
            }
        )

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_n]


def get_top_recipes(
    detected: List[str],
    top_n: int = 10,
    limit_per_ingredient: int = 300,
    max_total: int = 2000,
) -> Dict[str, Any]:
    candidates = fetch_candidate_recipes(
        detected=detected,
        limit_per_ingredient=limit_per_ingredient,
        max_total=max_total,
    )
    recipes = suggest_recipes_from_records(detected, candidates, top_n=top_n)
    return {"recipes": recipes, "candidate_count": len(candidates)}
