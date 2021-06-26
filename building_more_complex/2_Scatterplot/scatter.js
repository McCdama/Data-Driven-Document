async function drawScatterplot() {
  //d3-fetch: d3.csv(), d3.json, d3.xml() ...
  const dataset = await d3.json("./../my_weather_data.json");
  console.log(dataset[0]);
  //console.table(dataset);

  // Accessor func convert a single data point(a row in a DB --> item || --> Object) into the metric value
  const xAccessor = (d) => d.dewPoint;
  const yAccessor = (d) => d.humidity;

  // A chart contains two container:
  //1 Wrapper: contains the entire chart(elements, axes, labels),
  //2 Bound: (data elements / -> line).

  // DIMENSIONS OBJECT ->>> the size of the wrapper and the margin.
  //d3-array Module >> min takes two args:
  // 1- an array of data points
  // 2- an accesor func to grab the value from each data point--here no need to specify it

  const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);

  let dimensions = {
    width: width,
    height: width,
    margin: { top: 10, right: 10, bottom: 50, left: 50 },
  };

  //COMPUTE the size of the BOUND
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // SELECTION:
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  // create the BOUNDing Box
  // use a "g" as it if a <div> of an SVG
  //use style to shift the Bounds
  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  //SCALES ´ meanining: convert the value of the temperature into pixel space** use here d3-scale / d3-array
  //create instance of scaleLinear()
  // Domain: min and max of the input
  // Range : min and max of the input
  //const yScale = d3.scaleLinear();
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    /* add nice() to round the scale's domain */
    .nice();

  //d3.extent takes two para: -1 an array of data points 2- an accessor func
  //console.log(d3.extent(dataset, yAccessor)); //--> will give us the min and max
  //const yScale = d3.scaleLinear().domain(d3.extent(dataset, yAccessor));

  // RANGE: use the boundedHeight to stay within the margin ->> SVG y-values starts from the top to bottom

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();
  //console.log(yScale(32)); // tell us how far away the freezing point will be from the bottom of the y scale
  // TEST Circle
  /* bounds
    .append("circle")
    .attr("cx", dimensions.boundedWidth / 2)
    .attr("cy", dimensions.boundedHeight / 2)
    .attr("r", 5); */

  // works for now !
  /* dataset.forEach((d) => {
    bounds
      .append("circle")
      .attr("cx", xScale(xAccessor(d)))
      .attr("cy", yScale(yAccessor(d)))
      .attr("r", 5);
  }); */

  // Data join: grabbing all <circle> elements in a d3 selection Object --> selectAll() and pass the dataset to the selection's .data() method
  //const dots = bounds.selectAll("circle").data(dataset);
  // when we calling our array of data points.. we are joining our selected elements with our array of data points

  /* JOIN SCHEMATIC : 'new' _enter, 'existing'  _groups, 'old' _exit*/
  /*   let dotsy = bounds.selectAll("circle"); // we are joining an empty array!
  console.log(dotsy);
  dotsx = dotsy.data(dataset); // we have now two new keys: _enter  , _exit
  console.log(dotsx); //see the __data__ prop inside the values of enter */

  /* const dott = bounds.selectAll("circle").data(dataset).enter();
  console.log(dott);
  const dottt = bounds
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle");
  console.log(dottt); */

  /* const dots = bounds
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("cy", (d) => yScale(yAccessor(d)))
    .attr("r", 5)
    .attr("fill", "cornflowerblue"); */

  function drawDots(dataset, color) {
    const dots = bounds
      .selectAll("circle")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(xAccessor(d)))
      .attr("cy", (d) => yScale(yAccessor(d)))
      .attr("r", 5)
      .attr("fill", color);
  }
  drawDots(dataset.slice(0, 200), "darkgrey");
  setTimeout(() => {
    drawDots(dataset, "blue");
  }, 1000);

  //instead if running .enter(), .append(), .merge() --> use just .join()

  //DRAW PERIPHERALS;
  // DRAWING AXES::: use d3-axis Module which draw an axis for a given scale
  // axisTop, axisRight, axisBottom, axisLeft

  const xAxisGenerator = d3.axisBottom().scale(xScale);
  //const xAxis = bounds.append("g").call(xAxisGenerator); // shows at the top!!
  //shift it to the bottom using CCS transform
  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);
  // LABEL
  const xAxisLabel = xAxis
    .append("text")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom - 10)
    .attr("fill", "black")
    .style("font-size", "1.4em")
    .html("DEW POINT (&deg;F)");
  const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(4); //when we call it, it will create a lot of elements
  // create a g element to hold all of those elements, and pass a new element to the yAxisGen func to tell where to draw the axis

  //const yAxis = bounds.append("g");
  // .call() will excute the provided func with the selection as the first para
  // 1- prevent saving the selection as a var
  // 2- preserve the selection for additional chaining.
  //  in other words: we are parsing the function yAxisGen to .call(), which then runs the function for us.
  const yAxis = bounds.append("g").call(yAxisGenerator);
  //LABEL
  const yAxisLabel = yAxis
    .append("text")
    .attr("x", -dimensions.boundedWidth / 2)
    .attr("y", -dimensions.margin.left + 10)
    .attr("fill", "black")
    .style("font-size", "1.4em")
    /* ROTATING */

    .text("Relative humidity")
    .style("transform", "rotate(-90deg)")
    .style("text-anchor", "middle");
}
drawScatterplot();
