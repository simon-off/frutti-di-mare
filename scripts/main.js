const resultsEl = document.querySelector(".results");
const searchField = document.querySelector("#search");
const showSelect = document.querySelector("#show-amount");
const sortSelect = document.querySelector("#sort-by");

const apiURL = "https://www.fishwatch.gov/api/species";

let fishCache;

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
  // sort by fat
  if (sortValue === "Fat, Total") {
    return fishes.sort((a, b) => {
      const valueA = a[sortValue].split(" ")[0];
      const valueB = b[sortValue].split(" ")[0];
      return valueB - valueA;
    });
  }
  // sort by calories
  return fishes.sort((a, b) => b[sortValue] - a[sortValue]);
}

function createResultMarkup(fish) {
  const markup = document.createElement("article");
  markup.classList.add("result");
  markup.innerHTML = `
    <div class="result__head">
      <div class="result__head__expand">
        <h3>${fish["Species Name"]}</h3>
      </div>
    </div>
    <div class="result__body">
      <p>Calories: ${fish["Calories"]}</p>
      <p>Fat: ${fish["Fat, Total"]}</p>
    </div>
  `;
  const expand = markup.querySelector(".result__head__expand");

  // Expand button
  const expandButton = document.createElement("input");
  expandButton.classList.add("expand");
  expandButton.type = "image";
  expandButton.src = "../svg/arrow.svg";
  expandButton.alt = "Expand result";
  expand.addEventListener("click", () => markup.classList.add("expanded"));
  expand.append(expandButton);

  // Add button
  const addButton = document.createElement("input");
  addButton.classList.add("add");
  addButton.type = "image";
  addButton.src = "../svg/plus.svg";
  addButton.alt = "Add result to collection";
  addButton.addEventListener("click", () => addResult(fish));
  markup.querySelector(".result__head").append(addButton);

  //
  fish.markup = markup;
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
    if (!fish.markup) createResultMarkup(fish);
    resultsEl.append(fish.markup);
  }
}

function fetchSuccess(data) {
  // Make sure there's no null values
  for (let fish of data) {
    if (!fish["Fat, Total"]) fish["Fat, Total"] = "0";
    if (!fish["Calories"]) fish["Calories"] = "0";
  }
  updateResults(data);
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

searchField.addEventListener("input", () => updateResults());
showSelect.addEventListener("input", () => updateResults());
sortSelect.addEventListener("input", () => updateResults());

// FIXME: DO NOT FORGET
fetchData("species.json");
