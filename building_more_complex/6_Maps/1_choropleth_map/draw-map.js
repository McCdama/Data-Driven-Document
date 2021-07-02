async function drawMap() {
  const countryShapes = await d3.json("./../world-geojson.json");
  console.log(countryShapes);
}
drawMap();
