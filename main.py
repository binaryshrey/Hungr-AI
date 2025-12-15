from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import io, json, os
from PIL import Image

from app.ml.model import FruitVegClassifier

MODEL_DIR = os.getenv("MODEL_DIR", "app/model")
RECIPES_PATH = os.getenv("RECIPES_PATH", "app/data/recipes.json")

clf = FruitVegClassifier(model_dir=MODEL_DIR)

RECIPES: List[Dict[str, Any]] = []
if os.path.exists(RECIPES_PATH):
    with open(RECIPES_PATH, "r") as f:
        RECIPES = json.load(f)

def suggest_recipes(detected: List[str], top_n: int = 10):
    P = set([d.lower() for d in detected])
    scored = []
    for r in RECIPES:
        R = set([x.lower() for x in r.get("ingredients", [])])
        matched = sorted(list(P & R))
        if not matched:
            continue
        missing = sorted(list(R - P))
        score = len(matched) / max(len(P), 1)
        scored.append({
            "title": r.get("title", "Untitled"),
            "score": score,
            "matched": matched,
            "missing": missing,
            "instructions": r.get("instructions", ""),
        })
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_n]

app = FastAPI(title="Fruit/Veg Classifier API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"alive": True}

@app.get("/classes")
def classes():
    return {"num_classes": len(clf.classes), "classes": clf.classes}

@app.post("/predict")
async def predict(files: List[UploadFile] = File(...)):
    preds = []
    for f in files:
        data = await f.read()
        img = Image.open(io.BytesIO(data)).convert("RGB")
        label, conf = clf.predict_pil(img)
        preds.append({"filename": f.filename, "label": label, "confidence": conf})

    ingredients = sorted(list({p["label"] for p in preds}))
    recipes = suggest_recipes(ingredients, top_n=10)

    return {"predictions": preds, "ingredients": ingredients, "recipes": recipes}
