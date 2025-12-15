import json
import os
import torch
import timm
from PIL import Image
from torchvision import transforms

class FruitVegClassifier:
    def __init__(self, model_dir: str, device: str | None = None):
        cfg_path = os.path.join(model_dir, "model_config.json")
        classes_path = os.path.join(model_dir, "classes.json")
        weights_path = os.path.join(model_dir, "best_weights.pt")

        with open(cfg_path, "r") as f:
            self.cfg = json.load(f)
        with open(classes_path, "r") as f:
            self.classes = json.load(f)

        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = device

        self.model = timm.create_model(
            self.cfg["backbone"],
            pretrained=False,
            num_classes=len(self.classes),
        ).to(self.device)

        self.model.load_state_dict(torch.load(weights_path, map_location=self.device))
        self.model.eval()

        img_size = int(self.cfg["img_size"])
        self.tfm = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(img_size),
            transforms.ToTensor(),
        ])

    @torch.no_grad()
    def predict_pil(self, img: Image.Image):
        img = img.convert("RGB")
        x = self.tfm(img).unsqueeze(0).to(self.device)
        logits = self.model(x)
        prob = torch.softmax(logits, dim=1)[0]
        idx = int(prob.argmax().item())
        return self.classes[idx], float(prob[idx].item())
