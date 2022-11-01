async function fetchData() {
  const result = await fetch("https://www.fishwatch.gov/api/species/red-snapper");
  console.log(result);
  const data = await result.json();
  console.log(data);
}

fetchData();
