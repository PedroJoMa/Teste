import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import MealRecipe from '../components/MealRecipe';
import DrinkRecipe from '../components/DrinkRecipe';
import getMealApi from '../services/MealApi';
import getCockTailApi from '../services/CockTailApi';

export default function RecipeDetails() {
  const [recipe, setRecipe] = useState([]);
  const [statusDone, setStatusDone] = useState(false);
  const [statusInProgress, setStatusInProgress] = useState(true);
  const { location: { pathname } } = useHistory();
  const path = pathname.split('/');

  const changeRecipe = (recipeApi) => {
    const recipeEntries = Object.entries(recipeApi);
    const changedEntries = recipeEntries.filter(([chave, valor]) => (
      (valor !== ' ' && valor !== '' && valor) && [chave, valor]
    ));

    const moreInfos = changedEntries.filter(([chave, valor]) => {
      let validedInfos = [];
      if (!chave.includes('strIngredient') && !chave.includes('strMeasure')) {
        validedInfos = [chave, valor];
      }
      return validedInfos;
    });

    const ingredientsArray = changedEntries
      .filter(([chave]) => chave.includes('strIngredient'));
    const mensureArray = changedEntries
      .filter(([chave]) => chave.includes('strMeasure'));

    const newRecipe = {
      ingredients: [],
      mensures: [],
    };

    const { ingredients, mensures } = newRecipe;

    moreInfos.forEach(([chave, valor]) => { newRecipe[chave] = valor; });
    ingredientsArray.forEach((ingredient) => ingredients.push(ingredient[1]));
    mensureArray.forEach((mensure) => mensures.push(mensure[1]));

    return newRecipe;
  };

  useEffect(() => {
    const getApiRecipe = async () => {
      const recipeResponse = path[1] === 'foods' ? await getMealApi('recipe', path[2])
        : await getCockTailApi('recipe', path[2]);
      const getResponse = path[1] === 'foods' ? recipeResponse.meals
        : recipeResponse.drinks;
      setRecipe(changeRecipe(getResponse[0]));
    };
    getApiRecipe();
  }, []);

  useEffect(() => {
    const recipesDone = JSON.parse(localStorage.getItem('doneRecipes'));
    const inProgressRecipes = JSON.parse(localStorage.getItem('inProgressRecipes'));
    if (inProgressRecipes && (
      inProgressRecipes.meals[path[2]] || inProgressRecipes.cocktails[path[2]])) {
      setStatusDone(false);
      setStatusInProgress(true);
      console.log('entrou no primeiro if');
    } else if (recipesDone) {
      const statusRecipe = recipesDone.some(({ id }) => (
        id === recipe.idMeal || id === recipe.idDrink
      ));
      console.log(statusRecipe);
      setStatusDone(!statusRecipe);
      setStatusInProgress(false);
      console.log('entrou no segundo if');
    } else {
      setStatusDone(true);
      setStatusInProgress(false);
      console.log('entrou no else');
    }
  }, [recipe]);

  return (
    <section>
      { recipe.idMeal && <MealRecipe recipe={ recipe } /> }
      { recipe.idDrink && <DrinkRecipe recipe={ recipe } /> }
      {
        statusDone
        && (
          <button
            type="button"
            data-testid="start-recipe-btn"
            style={ { position: 'fixed', bottom: '0' } }
          >
            Start Recipe
          </button>
        )
      }
      {
        statusInProgress
      && (
        <button
          type="button"
          data-testid="start-recipe-btn"
          style={ { position: 'fixed', bottom: '0' } }
        >
          Continue Recipe
        </button>
      )
      }
    </section>
  );
}
