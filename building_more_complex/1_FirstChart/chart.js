async function drawLineChart() {
  //d3-fetch: d3.csv(), d3.json, d3.xml() ...
  const dataset = await d3.json("./../my_weather_data.json");
  console.log(dataset[0]);
  //console.table(dataset);

  // Accessor func convert a single data point(a row in a DB --> item || --> Object) into the metric value
  const yAccessor = (d) => d.temperatureMax;

  //const xAccessor = (d) => d.date; // but date here is a string .. convert it into timeParse
  const dateParser = d3.timeParse("%Y-%m-%d");
  const xAccessor = (d) => dateParser(d.date);
  //console.log(xAccessor(dataset[0]));

  // A chart contains two container: the 1-wrapper: contains the entire chart(elements, axes, labels) , and the 2-bound(data elements/->line).

  // DIMENSIONS OBJECT ->>> the size of the wrapper and the margin.
  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margin: { top: 15, right: 15, bottom: 40, left: 60 },
  };

  //COMPUTE the size of the BOUND
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  /*  // SELECTION:
  const wrapper = d3.select("#wrapper");
  console.log(wrapper); // see _groups list .. containg the wrapper

  const svg = wrapper.append("svg");
  console.log(svg); // hover over the svg and see the 300px*150px

  //set the size of svg
  svg.attr("width", dimensions.width);
  svg.attr("height", dimensions.height);
  // hover over the svg and see the flexibility to 900px* and steady 400px */

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

  //d3.extent takes two para: -1 an array of data points 2- an accessor func
  //console.log(d3.extent(dataset, yAccessor)); --> will give us the min and max
  //const yScale = d3.scaleLinear().domain(d3.extent(dataset, yAccessor));

  // RANGE: use the boundedHeight to stay within the margin ->> SVG y-values starts from the top to bottom
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0]);
  console.log(yScale(32)); // tell us how far away the freezing point will be from the bottom of the y scale

  const freezingTemperaturePlacement = yScale(32);
  const freezingTemperatures = bounds
    .append("rect")
    .attr("x", 0)
    .attr("width", dimensions.boundedWidth)
    .attr("y", freezingTemperaturePlacement)
    .attr("height", dimensions.boundedHeight - freezingTemperaturePlacement)
    .attr("fill", "#e0f3f3"); /* change it from black */

  // we are working here with data object==>> use a time scale which knows how to handle data objects
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  // draw: use the d3-shape Module
  //const lineGenerator = d3.line();
  // needs info: 1- how to find an x axis 2- how to find a y axis value
  //we can set these with the x and y methods
  // use the accessor functions !! BUT they return the UNSCALED VALUE!!!!
  // Transform the data point with both: the accessor func and the scale func    to get the scaled value in pixel
  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)));

  // adding the path element to the bounds
  //const line = bounds.append("path");
  // feeding the dataset to the lineGen to create the d(short for data) attribute
  // and tell the line what shape to be
  //const line = bounds.append("path").attr("d", lineGenerator(dataset)); // sth wrong !? YES ITS BLACK BY DEF

  const line = bounds
    .append("path")
    .attr("d", lineGenerator(dataset))
    .attr("fill", "none")
    .attr("stroke", "#af3453")
    .attr("stroke-width", 2);

  // DRAWING AXES::: use d3-axis Module which draw an axis for a given scale
  // axisTop, axisRight, axisBottom, axisLeft
  const yAxisGenerator = d3.axisLeft().scale(yScale); //when we call it, it will create a lot of elements
  // create a g element to hold all of those elements, and pass a new element to the yAxisGen func to tell where to draw the axis

  //const yAxis = bounds.append("g");
  // .call() will excute the provided func with the selection as the first para
  // 1- prevent saving the selection as a var
  // 2- preserve the selection for additional chaining.
  //  in othe word : we are parsing the function yAxisGen to .call(), which then runs the function for us.
  const yAxis = bounds.append("g").call(yAxisGenerator);

  const xAxisGenerator = d3.axisBottom().scale(xScale);
  //const xAxis = bounds.append("g").call(xAxisGenerator); // shows at the top!!
  //shift it to the bottom using CCS transform
  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);
}
drawLineChart();
