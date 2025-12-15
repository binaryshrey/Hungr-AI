from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import io, os
from PIL import Image

from app.ml.model import FruitVegClassifier
from app.ml.service import get_top_recipes

MODEL_DIR = os.getenv("MODEL_DIR", "app/model")
clf = FruitVegClassifier(model_dir=MODEL_DIR)

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

    ingredients = sorted({p["label"] for p in preds})

    result = get_top_recipes(
        detected=ingredients,
        top_n=10,
        limit_per_ingredient=300,
        max_total=2000,
    )

    return {
        "predictions": preds,
        "ingredients": ingredients,
        "recipes": result["recipes"],
        "candidate_count": result["candidate_count"],
    }
