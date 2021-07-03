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
  dataset.forEach((d) => {
    if (d["Series Name"] != metric) return;
    metricDataByCountry[d["Country Code"]] = +d["2017 [YR2017]"] || 0;
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

  /* plot te hole earth to cover the full bounded width, then measure the height. */
  /* define the globe using mock-GeoJSON format. */

  const sphere = { type: "Sphere" };

  /* use the d3-geo / d3-geo-projecion functions to convert from lat, lng coords to x, y pixel coords. --> THE SCALE */
  const projection = d3
    .geoEqualEarth()
    /* now the size should be the same as the bounds
     * update the proj. widths --> fitWidth( , )
     */ .fitWidth(dimensions.boundedWidth, sphere);

  /* Hieght */
  const pathGenerator = d3.geoPath(projection);
  console.log(pathGenerator(sphere)); // similar to line generator 'd3.line()'

  /* TALL using .bounds() */
  console.log(pathGenerator.bounds(sphere));
  /* use ES6 to grab the y1 vaalue */
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(sphere);
  /* we want the entire earth to fit within our bounds --> set the boundedHeight to just cover the sphere */
  dimensions.boundedHeight = y1;
  dimensions.height =
    dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom;
  /* Wrapper and Bound section. */
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);
  console.log(wrapper);

  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left},${dimensions.margin.top})`
    );
  console.log(bounds);

  // create SCALE
  /* A scale to turn the metric value (population growth amounts) into color values */
  const metricValues = Object.values(metricDataByCountry);
  console.log(metricValues);
  /* extraxt small and large */
  const metricValueExtent = d3.extent(metricValues);
  console.log(metricValueExtent);

  /* create a piecewise scales (middle)--> multiple scale in one */
  const maxChange = d3.max([-metricValueExtent[0], metricValueExtent[1]]);
  const colorScale = d3
    .scaleLinear()
    .domain([-maxChange, 0, maxChange])
    .range(["indigo", "white", "darkgreen"]);
}
drawMap();
