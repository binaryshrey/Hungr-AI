# Hungr AI 

**Food Ingredient Classification and Recipe Recommendation using CNN and Transfer Learning**

ECE-GY 6143 · Intro to Machine Learning --- Course Project

**Author:** Shreyansh Saurabh\
**NetID:** ss21034

-   **GitHub:** https://github.com/binaryshrey/Hungr-AI\
-   **Live Demo:** https://hungrai-6143.vercel.app/



## Project Overview

Hungr AI is an end-to-end machine learning web application where users upload multiple images of fruits and vegetables and the system:

1.  Detects the ingredients present in the images (e.g., apple, tomato,
    onion)
2.  Recommends recipes that best match the detected ingredients

The project demonstrates a complete ML lifecycle: dataset preprocessing, CNN-based image classification using transfer learning, model evaluation, backend inference serving, database-backed recipe retrieval and frontend deployment.


## Machine Learning Concepts & Methods

-   Supervised learning (image classification)
-   Convolutional Neural Networks (CNNs)
-   Transfer learning with pretrained backbones (EfficientNet)
-   Train / validation / test split
-   Model evaluation and metrics
-   Top-1 / Top-3 / Top-5 accuracy
-   Confusion matrix and error analysis


## Tech Stack

### ML & Data

-   Python
-   PyTorch, torchvision, timm
-   pandas

### Backend

-   FastAPI
-   Supabase (Postgres)

### Frontend

-   React
-   Vercel

### Deployment

-   Render (API)
-   Vercel (Frontend)


## Data Sources

### Vision Dataset

-   **Kaggle:** Fruit and Vegetable Image Recognition
    -   36 classes (apple, banana, garlic, etc.)
    -   Used for training the CNN classifier\
        Link : https://www.kaggle.com/datasets/kritikseth/fruit-and-vegetable-image-recognition

### Recipe Dataset

-   **Kaggle:** RecipeNLG
    -   Large-scale recipe dataset
    -   Preprocessed and stored (subset \~200k recipes) in Supabase\
        Link : https://www.kaggle.com/datasets/paultimothymooney/recipenlg

All datasets are public and used strictly for academic purposes.


## Analysis Plan

### Data Cleaning & Preparation

**Vision Dataset** - Verified folder structure and labels - Image
resizing and normalization - Light augmentation (flip, rotation)

**Recipe Dataset** - Safe JSON parsing - Ingredient text normalization -
CSV export and Supabase ingestion


## Labels & Outputs

### Vision Model

-   Single label per image (fruit/vegetable)
-   Multi-image input → merged unique ingredient set

### Recipe Output

-   Ranked by ingredient overlap
-   Matched ingredients
-   Missing ingredients (optional)
-   Recipe title and instructions


## Feature Engineering

**Vision** - No manual feature extraction - CNN learns features directly from pixels

**Recipes** - Ingredient normalization - Optional synonym mapping (e.g., capsicum ↔ bell pepper)


## Exploratory Data Analysis

-   Class distribution analysis
-   Confusion matrix for similar ingredients
-   Recipe coverage and ingredient frequency


## Model Training & Evaluation

-   EfficientNet with transfer learning
-   Metrics:
    -   Loss
    -   Top-1 / Top-3 / Top-5 accuracy
-   Confusion matrix visualization

**Saved Artifacts** - `best_model.pt` - `classes.json` -
`model_config.json`



## Model Interpretation

-   Analysis of common misclassifications
-   Identification of visually similar classes
-   Qualitative evaluation of recipe retrieval quality



## System Architecture

### 1. Frontend (React + Vercel)

-   Multi-image upload UI
-   Async requests to backend
-   Displays:
    -   Per-image predictions
    -   Merged ingredient list
    -   Ranked recipe recommendations

**Concepts:** SPA, async APIs, multipart upload, CORS



### 2. Backend API (FastAPI)

**Endpoints** - `GET /health` - `POST /predict` - `POST /recipes/search`
(optional)

**Inference Pipeline** 
1. Receive images
2.  Preprocess images
3.  Run CNN inference
4.  Merge predicted ingredients
5.  Query Supabase recipes
6.  Rank and return results



### 3. ML Inference Service

-   PyTorch model loaded at startup
-   CPU-based inference
-   `torch.no_grad()` for efficiency
-   Softmax confidence scores



### 4. Database Layer (Supabase Postgres)

-   Stores recipes as JSONB
-   Ingredient overlap matching
-   Recommended improvement:
    -   `TEXT[]` ingredients column
    -   GIN index for fast overlap queries



### 5. Deployment

-   **Frontend:** Vercel
-   **Backend:** Render
-   Python 3.11 runtime
-   Environment variables:
    -   `SUPABASE_URL`
    -   `SUPABASE_SERVICE_ROLE_KEY`



## Learning Outcomes

-   Built and deployed an end-to-end ML system
-   Applied CNN transfer learning in practice
-   Designed scalable ML-backed APIs
-   Integrated ML inference with a real database
-   Deployed a full-stack ML application to production



## License

This project is developed for academic purposes as part of ECE-GY 6143.
