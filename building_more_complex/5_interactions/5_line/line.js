async function drawLineChart() {
  // 1. Access data

  let dataset = await d3.json("./../../my_weather_data.json");

  const yAccessor = (d) => d.temperatureMax;
  const dateParser = d3.timeParse("%Y-%m-%d");
  const xAccessor = (d) => dateParser(d.date);
  dataset = dataset.sort((a, b) => xAccessor(a) - xAccessor(b)).slice(0, 100);

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. Draw canvas

  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = wrapper
    .append("g")
    .attr(
      "transform",
      `translate(${dimensions.margin.left}, ${dimensions.margin.top})`
    );

  bounds
    .append("defs")
    .append("clipPath")
    .attr("id", "bounds-clip-path")
    .append("rect")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight);

  const clip = bounds.append("g").attr("clip-path", "url(#bounds-clip-path)");

  // 4. Create scales

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0]);

  const freezingTemperaturePlacement = yScale(32);
  const freezingTemperatures = clip
    .append("rect")
    .attr("class", "freezing")
    .attr("x", 0)
    .attr("width", d3.max([0, dimensions.boundedWidth]))
    .attr("y", freezingTemperaturePlacement)
    .attr(
      "height",
      d3.max([0, dimensions.boundedHeight - freezingTemperaturePlacement])
    );

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  // 5. Draw data

  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)));

  const line = clip
    .append("path")
    .attr("class", "line")
    .attr("d", lineGenerator(dataset));

  // 6. Draw peripherals

  const yAxisGenerator = d3.axisLeft().scale(yScale);

  const yAxis = bounds.append("g").attr("class", "y-axis").call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 10)
    .html("Minimum Temperature (&deg;F)");

  const xAxisGenerator = d3.axisBottom().scale(xScale);

  const xAxis = bounds
    .append("g")
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .call(xAxisGenerator);

  // 7. Set up interactions
  /* display a tooltip whenever hovering anywehre on the chart
   * we want an element that spans the entire BOUNDS.
   */
  const listeningRect = bounds
    .append("rect")
    .attr("class", "listening-rect")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave);

  const tooltip = d3.select("#tooltip");
  function onMouseMove(e) {
    //  console.log("In");
    // we have location problem here.. how do we know -->d3.mouse()!! Deprec use now d3.pointer(e) return x,y coords of the mouse event.
    const mousePosition = d3.pointer(e);

    //console.log(mousePosition);

    /* what data we're hovering over
     * how do we convert an x position into a date--
     * earlier we've used scale to convert from data space to pixel space */

    const hoveredDate = xScale.invert(mousePosition[0]);
    //console.log(hoveredDate); // GREAZ

    /* Now.. find the closest data point.
     *** where a variable will fit in a sorted list->  use scan(array, comparator) see: https://www.geeksforgeeks.org/d3-js-d3-scan-function/
     */
    /* function to find the distance btw the hovered point and a datapoint */
    const getDistanceFromHoveredDate = (d) =>
      Math.abs(xAccessor(d) - hoveredDate);

    /* function to compare the two data points in the scan() =>this will create an array
     * of distances from the hovered point , and get the index of the closest data point to the hovered date.
     */
    const closestIndex = d3.scan(
      dataset,
      (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    );
    /* grab the data point at the index */
    const closestDataPoint = dataset[closestIndex];
    //console.table(closestDataPoint); //hover on the left and see dates close to the beginning of the data set.
    /* grab the closest x and y values using the accessor func. */
    const closestXValue = xAccessor(closestDataPoint);
    const closestYValue = yAccessor(closestDataPoint);
    /* use the closestXValue to set the date in the tooltip */
    const formatDate = d3.timeFormat("%B %A %-d, %Y");
    tooltip.select("#date").text(formatDate(closestXValue));
    /* set the temperature value in the tooltip */
    const fomatTemperature = (d) => `${d3.format(".1f")(d)}°F`;
    tooltip.select("#temperature").text(fomatTemperature(closestYValue));

    /* LASTLY, grab the x and y position of the closest point,
     * shift the tooltip
     * hide/show the tooltip appropriately
     */

    const x = xScale(closestXValue) + dimensions.margin.left;
    const y = yScale(closestYValue) + dimensions.margin.top;

    tooltip.style(
      "transform",
      `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
    );

    tooltip.style("opacity", 1);
  }
  function onMouseLeave() {
    ///console.log("Out");

    tooltip.style("opacity", 0);
  }
}
drawLineChart();
