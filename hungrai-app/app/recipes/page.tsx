"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface Prediction {
  filename: string;
  label: string;
  confidence: number;
}

interface Recipe {
  id: number;
  title: string;
  score: number;
  matched: string[];
  missing: string[];
  instructions: string[];
}

interface RecipeResults {
  predictions: Prediction[];
  ingredients: string[];
  recipes: Recipe[];
  candidate_count: number;
}

interface ClassesResponse {
  num_classes: number;
  classes: string[];
}

const RecipesPage = () => {
  const router = useRouter();
  const [results, setResults] = useState<RecipeResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingredientsList, setIngredientsList] =
    useState<ClassesResponse | null>(null);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);

  useEffect(() => {
    // Get results from localStorage
    const storedResults = localStorage.getItem("recipeResults");
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    setLoading(false);
  }, []);

  // Function to fetch ingredients list
  const fetchIngredientsList = async () => {
    setLoadingIngredients(true);
    try {
      const response = await fetch("https://hungr-ai.onrender.com/classes", {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ClassesResponse = await response.json();
      setIngredientsList(data);
    } catch (error) {
      console.error("Error fetching ingredients list:", error);
    } finally {
      setLoadingIngredients(false);
    }
  };

  // Fetch ingredients when dialog opens
  useEffect(() => {
    if (dialogOpen && !ingredientsList) {
      fetchIngredientsList();
    }
  }, [dialogOpen]);

  // Function to get random cooking time
  const getRandomCookingTime = () => {
    const times = ["20 mins", "30 mins", "45 mins"];
    return times[Math.floor(Math.random() * times.length)];
  };

  // Function to handle recipe click
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setRecipeDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No results found</p>
          <Button
            onClick={() => router.push("/upload_ingredients")}
            className="bg-white text-black hover:bg-neutral-200"
          >
            Upload Ingredients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <div className="px-6 pt-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-semibold text-white">Hungr AI</span>
          </a>
          <div className="flex gap-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white border border-white hover:bg-neutral-900">
                  Ingredients List
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-900 border-zinc-800 text-white max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    Available Ingredients
                  </DialogTitle>
                  <DialogDescription className="text-neutral-400">
                    {ingredientsList
                      ? `Total: ${ingredientsList.num_classes} classified ingredients`
                      : "Loading..."}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 pr-2">
                  {loadingIngredients ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-neutral-400">
                        Loading ingredients...
                      </div>
                    </div>
                  ) : ingredientsList ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pb-4">
                      {ingredientsList.classes.map((ingredient, index) => (
                        <Badge
                          key={index}
                          className="bg-neutral-800 text-white border border-zinc-700 hover:bg-neutral-700 justify-center py-2 capitalize"
                        >
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-neutral-400">
                        Failed to load ingredients
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={() => router.push("/upload_ingredients")}
              className="bg-white text-black hover:bg-neutral-200"
            >
              Upload New
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Ingredients Identified Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ingredients Identified
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.predictions.map((pred, index) => (
              <div
                key={index}
                className="bg-neutral-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold capitalize text-lg">
                      {pred.label}
                    </p>
                    <p className="text-neutral-400 text-sm mt-1">
                      Confidence: {(pred.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Detected
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Recipes Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">
            Suggested Recipes
          </h2>
          <p className="text-neutral-400 mb-8">
            Found {results.recipes.length} recipes matching your ingredients
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.recipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => handleRecipeClick(recipe)}
                className="bg-neutral-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all hover:shadow-xl cursor-pointer"
              >
                {/* Recipe Image Placeholder */}
                <div
                  className="w-full h-48 flex items-center justify-center"
                  style={{
                    background: `
                      conic-gradient(at calc(250%/3) calc(100%/3), #999999 0 120deg, #0000 0),
                      conic-gradient(from -120deg at calc(50%/3) calc(100%/3), #cdcbcc 0 120deg, #0000 0),
                      conic-gradient(from 120deg at calc(100%/3) calc(250%/3), #f2f2f2 0 120deg, #0000 0),
                      conic-gradient(from 120deg at calc(200%/3) calc(250%/3), #f2f2f2 0 120deg, #0000 0),
                      conic-gradient(from -180deg at calc(100%/3) 50%, #cdcbcc 60deg, #f2f2f2 0 120deg, #0000 0),
                      conic-gradient(from 60deg at calc(200%/3) 50%, #f2f2f2 60deg, #999999 0 120deg, #0000 0),
                      conic-gradient(from -60deg at 50% calc(100%/3), #f2f2f2 120deg, #cdcbcc 0 240deg, #999999 0)
                    `,
                    backgroundSize: "calc(84px * 1.732) 84px",
                  }}
                ></div>

                {/* Recipe Details */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <svg
                      className="w-4 h-4 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-neutral-400 text-sm">
                      {getRandomCookingTime()}
                    </span>
                  </div>

                  {/* Matched Ingredients */}
                  <div className="mb-3">
                    <p className="text-neutral-500 text-xs mb-2">
                      Matched Ingredients:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.matched.map((ingredient, idx) => (
                        <Badge
                          key={idx}
                          className="bg-green-900/30 text-green-400 text-xs hover:bg-green-900/40"
                        >
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 text-xs">
                        Match Score
                      </span>
                      <span className="text-white font-semibold">
                        {(recipe.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {results.recipes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-400 text-lg">
                No recipes found with the detected ingredients
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
        <DialogContent className="bg-neutral-900 border-zinc-800 text-white max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold pr-8">
                  {selectedRecipe.title}
                </DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Match Score: {(selectedRecipe.score * 100).toFixed(0)}%
                </DialogDescription>
              </DialogHeader>

              <div className="overflow-y-auto flex-1 pr-2 space-y-6">
                {/* Recipe Image */}
                <div
                  className="w-full h-56 rounded-lg flex items-center justify-center"
                  style={{
                    background: `
                      conic-gradient(at calc(250%/3) calc(100%/3), #999999 0 120deg, #0000 0),
                      conic-gradient(from -120deg at calc(50%/3) calc(100%/3), #cdcbcc 0 120deg, #0000 0),
                      conic-gradient(from 120deg at calc(100%/3) calc(250%/3), #f2f2f2 0 120deg, #0000 0),
                      conic-gradient(from 120deg at calc(200%/3) calc(250%/3), #f2f2f2 0 120deg, #0000 0),
                      conic-gradient(from -180deg at calc(100%/3) 50%, #cdcbcc 60deg, #f2f2f2 0 120deg, #0000 0),
                      conic-gradient(from 60deg at calc(200%/3) 50%, #f2f2f2 60deg, #999999 0 120deg, #0000 0),
                      conic-gradient(from -60deg at 50% calc(100%/3), #f2f2f2 120deg, #cdcbcc 0 240deg, #999999 0)
                    `,
                    backgroundSize: "calc(84px * 1.732) 84px",
                  }}
                ></div>

                {/* Matched Ingredients */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">
                    Matched Ingredients
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.matched.map((ingredient, idx) => (
                      <Badge
                        key={idx}
                        className="bg-green-900/30 text-green-400 hover:bg-green-900/40 capitalize"
                      >
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Missing Ingredients */}
                {selectedRecipe.missing.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-white">
                      Missing Ingredients
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.missing.map((ingredient, idx) => (
                        <Badge
                          key={idx}
                          className="bg-orange-900/30 text-orange-400 hover:bg-orange-900/40 capitalize"
                        >
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cooking Instructions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">
                    Cooking Steps
                  </h3>
                  <div className="space-y-3">
                    {selectedRecipe.instructions.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 bg-neutral-800/50 p-3 rounded-lg border border-zinc-800"
                      >
                        <div className="shrink-0 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </div>
                        <p className="text-neutral-300 text-sm leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipesPage;
