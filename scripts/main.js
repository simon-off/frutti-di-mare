//===========================================================//
//+++ GLOBAL VARIABLES +++||---------------------------------//
//===========================================================//

const resultsEl = document.querySelector(".results");
const collectionEl = document.querySelector(".collection");
const searchField = document.querySelector("#search");
const showSelect = document.querySelector("#show-amount");
const sortSelect = document.querySelector("#sort-by");

const apiURL = "https://www.fishwatch.gov/api/species";

let fishCache;
let fishCollection = localStorage.getItem("fishes")
  ? JSON.parse(localStorage.getItem("fishes"))
  : [];

//===========================================================//
//+++ COMMON FUNCTIONS +++||---------------------------------//
//===========================================================//

// TODO: Lägg till mer stats
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
    <img src="${fish["Species Illustration Photo"].src}" alt="${fish["Species Illustration Photo"].alt}">
    <div class="item__facts">
      <p>Calories: ${fish["Calories"]} - Fat: ${fish["Fat, Total"]}g</p>
    </div>
  </div>
  `;
  const expand = markup.querySelector(".item__head__expand");

  // Expand button
  const expandButton = document.createElement("input");
  expandButton.classList.add("expand");
  expandButton.type = "image";
  expandButton.src = "../svg/arrow.svg";
  expandButton.alt = "Expand result";
  expand.addEventListener("click", () => markup.classList.toggle("expanded"));
  expand.append(expandButton);

  return markup;
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
  // sort by calories or fat
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

  //
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
  if (!fishCollection.includes(fish)) {
    fish.amount = 1;
    fishCollection.push(fish);
  } else {
    fish.amount += 1;
  }

  updateCollection();
}

//===========================================================//
//+++ COLLECTION FUNCTIONS +++||-----------------------------//
//===========================================================//

function updateCollectionStats() {
  // TODO: Uppdatera stats för alla fiskar va.
  console.log("hello");
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
  removeButton.alt = "Remove fish from collection";
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
    // Create markup for fish in collection if not present
    createCollectionMarkup(fish);

    const amountSpan = fish.collectionMarkup.querySelector("#amount-span");
    amountSpan.innerText = fish.amount + " - ";

    collectionEl.append(fish.collectionMarkup);
  }
}

function removeFish(fish) {
  fish.amount--;
  if (fish.amount < 1) {
    fishCollection.splice(fishCollection.indexOf(fish), 1);
  }
  updateCollection();
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
    // Remove "g" from fat
    fish["Fat, Total"] = fish["Fat, Total"].split(" ")[0];
  }

  updateResults(data);
  updateCollection();
  fishCache = data;
}

function fetchFail(result) {
  console.error(result.status, result.statusText);
}

async function fetchData(url) {
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

// FIXME: DO NOT FORGET
fetchData("species.json");
