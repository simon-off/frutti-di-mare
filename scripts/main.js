//===========================================================//
//+++ GLOBAL VARIABLES +++||---------------------------------//
//===========================================================//

const collectionSection = document.querySelector(".collection-section");
const collectionStats = document.querySelector(".collection-section__stats");
const collectionEl = document.querySelector(".collection");
const searchField = document.querySelector("#search");
const filterForm = document.querySelector(".results-section > form");
const showSelect = document.querySelector("#show-amount");
const resultsEl = document.querySelector(".results");
const sortSelect = document.querySelector("#sort-by");
const removeAllBtn = document.querySelector("#remove-all");

// Loading spinner
const loading = document.querySelector(".loading");
loading.start = () => (loading.style.display = "flex");
loading.stop = () => (loading.style.display = "none");

const apiURL = "https://www.fishwatch.gov/api/species";

let fishCache;
let fishCollection = localStorage.getItem("fishes")
  ? JSON.parse(localStorage.getItem("fishes"))
  : [];

//===========================================================//
//+++ COMMON FUNCTIONS +++||---------------------------------//
//===========================================================//

function createMarkup(fish) {
  const markup = document.createElement("article");
  markup.classList.add("item");
  markup.innerHTML = `
  <div class="item__head">
    <div class="item__head__expand">
      <h3>${fish["Species Name"]}</h3>
    </div>
  </div>
  <div class="item__body">
    <img src="${fish["Species Illustration Photo"].src}" 
    alt="${fish["Species Illustration Photo"].alt}">
    <ul class="item__stats">
      <li>Calories: ${fish["Calories"]}</li>
      <li>Protein: ${fish["Protein"]}g</li>
      <li>Fat: ${fish["Fat, Total"]}g</li>
    </ul>
    <div class="item__info">
      <hr>
      <p><b>Scientific Name: </b><i>${fish["Scientific Name"]}</i></p>
      <q>${fish.Quote}</q>
      <p><b>Taste:</b> ${fish.Taste.slice(3, -5)}</p>
      <p><b>Availability:</b> ${fish.Availability.slice(3, -5)}</p>
    </div>
  </div>
  `;
  const expand = markup.querySelector(".item__head__expand");

  // Expand button
  const expandButton = document.createElement("input");
  expandButton.classList.add("expand");
  expandButton.type = "image";
  expandButton.src = "../svg/arrow.svg";
  expandButton.alt = "Expand";
  expand.addEventListener("click", () => markup.classList.toggle("expanded"));
  expand.append(expandButton);

  return markup;
}

function playAnimation(targetEl, anim) {
  targetEl.classList.add(anim);
  setTimeout(() => {
    targetEl.classList.remove(anim);
  }, 200);
}

//===========================================================//
//+++ RESULT FUNCTIONS +++||---------------------------------//
//===========================================================//

function sortFishes(fishes) {
  const sortValue = sortSelect.value;

  // sort by name
  if (sortValue === "Species Name") {
    return fishes.sort((a, b) => {
      const valueA = a[sortValue].toUpperCase();
      const valueB = b[sortValue].toUpperCase();
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
    });
  }
  // sort by calories, protein or fat
  return fishes.sort((a, b) => b[sortValue] - a[sortValue]);
}

function createResultMarkup(fish) {
  const markup = createMarkup(fish);

  // Add button
  const addButton = document.createElement("input");
  addButton.classList.add("add");
  addButton.type = "image";
  addButton.src = "../svg/plus.svg";
  addButton.alt = "Add result to collection";
  addButton.addEventListener("click", () => saveFish(fish));
  markup.querySelector(".item__head").append(addButton);

  // Save markup to fish
  fish.resultMarkup = markup;
}

function updateResults(newData) {
  const data = newData ? newData : fishCache;
  let results = data;
  if (searchField.value) {
    results = data.filter((fish) => {
      return fish["Species Name"].toLowerCase().includes(searchField.value.toLowerCase());
    });
  }
  const amount = () => {
    if (showSelect.value === "all") return results.length;
    if (results.length < showSelect.value) return results.length;
    return showSelect.value;
  };
  const fishes = sortFishes(results).slice(0, amount());
  resultsEl.innerHTML = "";

  for (let fish of fishes) {
    // Create markup for fish in results if not present
    if (!fish.resultMarkup) createResultMarkup(fish);
    resultsEl.append(fish.resultMarkup);
  }
}

function saveFish(fish) {
  const savedFish = fishCollection.find((e) => e["Species Name"] === fish["Species Name"]);

  if (!savedFish) {
    fish.amount = 1;
    fishCollection.push(fish);
  } else {
    fish.amount = savedFish.amount;
    fishCollection.splice(fishCollection.indexOf(savedFish), 1, fish);
    fish.amount += 1;
  }

  updateCollection();
  playAnimation(fish.collectionMarkup.querySelector(".item__head"), "anim-add");
  playAnimation(collectionStats, "anim-add");
}

//===========================================================//
//+++ COLLECTION FUNCTIONS +++||-----------------------------//
//===========================================================//

function updateCollectionStats() {
  const cal = fishCollection.reduce((a, b) => a + Number(b["Calories"]) * b.amount, 0);
  const pro = fishCollection.reduce((a, b) => a + Number(b["Protein"]) * b.amount, 0);
  const fat = fishCollection.reduce((a, b) => a + Number(b["Fat, Total"]) * b.amount, 0);
  collectionStats.innerHTML = `
  <ul>
    <li>Total Calories: ${Math.round(cal * 10) / 10}</li>
    <li>Total Protein: ${Math.round(pro * 10) / 10}g</li>
    <li>Total Fat: ${Math.round(fat * 10) / 10}g</li>
  </ul>
  `;
}

function createCollectionMarkup(fish) {
  const markup = createMarkup(fish);

  // Add amount to header
  const amount = document.createElement("span");
  amount.id = "amount-span";
  markup.querySelector("h3").prepend(amount);

  // Remove button
  const removeButton = document.createElement("input");
  removeButton.classList.add("remove");
  removeButton.type = "image";
  removeButton.src = "../svg/cross.svg";
  removeButton.alt = "Remove";
  removeButton.addEventListener("click", () => removeFish(fish));
  markup.querySelector(".item__head").append(removeButton);

  //
  fish.collectionMarkup = markup;
}

function updateCollection() {
  localStorage.setItem("fishes", JSON.stringify(fishCollection));
  updateCollectionStats();
  collectionEl.innerHTML = "";

  for (let fish of fishCollection) {
    // Create markup for fish in collection
    createCollectionMarkup(fish);

    const amountSpan = fish.collectionMarkup.querySelector("#amount-span");
    amountSpan.innerText = fish.amount + "00g - ";

    collectionEl.append(fish.collectionMarkup);
  }
}

function removeFish(fish) {
  fish.amount--;
  if (fish.amount < 1) {
    fishCollection.splice(fishCollection.indexOf(fish), 1);
  }
  updateCollection();
  playAnimation(fish.collectionMarkup.querySelector(".item__head"), "anim-remove");
  playAnimation(collectionStats, "anim-remove");
}

function removeAllFish() {
  for (let fish of fishCollection) {
    fish.amount = 0;
  }
  fishCollection.length = 0;
  updateCollection();
  playAnimation(collectionSection, "anim-remove");
}

//===========================================================//
//+++ FETCH FUNCTIONS +++||----------------------------------//
//===========================================================//

function fetchSuccess(data) {
  // Remove duplicates
  const species = "Species Name";
  data = data.filter(
    (el, index, self) => index === self.findIndex((t) => t[species] === el[species])
  );

  for (let fish of data) {
    // Remove null values
    if (!fish["Fat, Total"]) fish["Fat, Total"] = "0";
    if (!fish["Calories"]) fish["Calories"] = "0";
    if (!fish["Protein"]) fish["Protein"] = "0";
    if (!fish["Scientific Name"]) fish["Scientific Name"] = "Missing information";
    if (!fish["Quote"]) fish["Quote"] = "Such fish!";
    if (!fish["Taste"]) fish["Taste"] = "Missing information";
    if (!fish["Availability"]) fish["Availability"] = "Missing information";
    // Remove "g" from fat
    fish["Fat, Total"] = fish["Fat, Total"].split(" ")[0];
    fish["Protein"] = fish["Protein"].split(" ")[0];
  }

  updateResults(data);
  updateCollection();
  fishCache = data;

  loading.stop();
}

function fetchFail(result) {
  loading.stop();
  resultsEl.innerHTML = `
    <div class="error">
      <p><b>${result.status}: ${result.statusText}</b></p>
      <p>Oops...</p>
    </div>
  `;
  console.error(result.status, result.statusText);
}

async function fetchData(url) {
  loading.start();
  const result = await fetch(url);
  if (!result.ok) return fetchFail(result);
  const data = await result.json();
  fetchSuccess(data);
}

//===========================================================//
//+++ EVENT LISTENERS +++||----------------------------------//
//===========================================================//

searchField.addEventListener("input", () => updateResults());
showSelect.addEventListener("input", () => updateResults());
sortSelect.addEventListener("input", () => updateResults());
removeAllBtn.addEventListener("click", () => removeAllFish());
filterForm.addEventListener("submit", (e) => e.preventDefault());

fetchData(apiURL);
