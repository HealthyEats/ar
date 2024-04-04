    
        function copyReferralLink() {
            const referralLink = "https://work-sniper.com";
            navigator.clipboard.writeText(referralLink).then(function() {
                alert("تم النسخ");
            }, function(err) {
                console.error('Failed to copy: ', err);
            });
        }

        document.getElementById("time-range").addEventListener("input", function() {
            var time = this.value;
            document.getElementById("time-label").textContent = time + " دقائق (كم لديك من الوقت؟)";
        });
        
    

    
        function translateText(textToTranslate) {
            var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(textToTranslate) + '&langpair=ar|en';

            return fetch(url)
                .then(response => response.json())
                .then(data => {
                    return data.responseData.translatedText;
                })
                .catch(error => {
                    console.error('Error:', error);
                    return null;
                });
        }

        function translateRecipeToArabic(recipe) {
            var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(recipe) + '&langpair=en|ar';

            return fetch(url)
                .then(response => response.json())
                .then(data => {
                    return data.responseData.translatedText;
                })
                .catch(error => {
                    console.error('Error:', error);
                    return null;
                });
        }

        document.getElementById("recipe-button").addEventListener("click", function() {
            const time = document.getElementById("time-range").value;
            const ingredientsInput = document.getElementById("ingredients-input");
            const ingredients = ingredientsInput.value;

            // Translate ingredients to English
            translateText(ingredients)
                .then(translatedIngredients => {
                    if (translatedIngredients) {
                        const defaultPreparationTime = time; // Set default preparation time
                        const appId = "9fa74179";
                        const appKey = "d1d5b7e7a12b05cbda6767a1fb30a3b9";
                        const url = `https://api.edamam.com/search?q=${translatedIngredients}&app_id=${appId}&app_key=${appKey}&time=${time}`;

                        fetch(url)
                            .then(response => response.json())
                            .then(data => {
                                const recipeList = document.getElementById("recipe-list");
                                recipeList.innerHTML = "";

                                data.hits.forEach(hit => {
                                    const recipe = hit.recipe;

                                    // Translate recipe to Arabic
                                    translateRecipeToArabic(recipe.label)
                                        .then(translatedRecipe => {
                                            // Translate ingredients to Arabic
                                            translateRecipeToArabic(recipe.ingredientLines.join('\n'))
                                                .then(translatedIngredients => {
                                                    const recipeItem = document.createElement("div");
                                                    recipeItem.classList.add("recipe-container");
                                                    recipeItem.innerHTML = `
                                                        <h2>${translatedRecipe}</h2>
                                                        <img class="recipe-image" src="${recipe.image}" alt="${translatedRecipe}">
                                                        <div>
                                                            <p><strong>وقت التحضير:</strong> ${defaultPreparationTime} دقيقة</p>
                                                            <p><strong>المكونات:</strong></p>
                                                            <ul>
                                                                ${translatedIngredients.split('\n').map(ingredient => `<li>${ingredient}</li>`).join('')}
                                                            </ul>
                                                            <p><strong>طريقة التحضير:</strong></p>
                                                            ${recipe.instructions ? `<ol>${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}</ol>` : `<p><a href="${recipe.url}" target="_blank">انقر هنا لرؤية طريقة التحضير</a></p>`}
                                                        </div>
                                                    `;
                                                    recipeList.appendChild(recipeItem);
                                                });
                                        });
                                });
                            });
                    } else {
                        console.error('Failed to translate ingredients');
                    }
                });
        });
    