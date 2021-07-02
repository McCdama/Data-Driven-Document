async function drawMap() {
  const countryShapes = await d3.json("./../world-geojson.json");
  console.log(countryShapes);

  const dataset = await d3.csv("./data_bank_data.csv"); // a little bit messy
  console.log(dataset);
  // 4-keys: crs, features, name, type. Each features has a geometry Obj and a prop.

  /* const countryNameAccessor = (d) => d.properties["NAME"];
    const countryIdAccessor = (d) => d.properties["ADM0_A3_IS"]; */

  const metric = "Population growth (annual %)";
  let metricDataByCountry = {};
  dataset.forEach((element) => {
    if (element["Series Name"] != metric)
      return (metricDataByCountry[element["Country Code"]] =
        +element["2017 [YR2017]"] || 0);
  });
  console.log(metricDataByCountry);

  let dimensions = {
    width: window.innerWidth * 0.9,
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  console.log(dimensions.width);
}
drawMap();
