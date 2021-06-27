async function drawLineChart() {
  // 1. Access data
  let dataset = await d3.json("./../../my_weather_data.json");

  // 2. Create chart dimensions

  const yAccessor = (d) => d.temperatureMax;
  const dateParser = d3.timeParse("%Y-%m-%d");
  const xAccessor = (d) => dateParser(d.date);
  dataset = dataset.sort((a, b) => xAccessor(a) - xAccessor(b)).slice(0, 100);

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
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );
  /*  we do not want to see the new point until it is with in our bounds!
   * --> hide out-of-bounds data with a <clipPath>.
   */

  bounds
    .append("defs")
    .append("clipPath")
    .attr("id", "bounds-clip-path") // <clipPath> not rendering at all! --> depends on its children.
    /* add a <rect> that covers the bounds. */
    .append("rect")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight);

  // init static elements
  bounds.append("rect").attr("class", "freezing");
  /* to use our <clipPath> we'll create a group with the attribute clip-path pointing to our <clipPath>'s id. */
  /* the order in which we draw SVG elements determmines their "z-index" */
  const clip = bounds.append("g").attr("clip-path", "url(#bounds-clip-path)");

  /* Now we can update our path to sit inside of our new Group, instead of the bounds */

  clip.append("path").attr("class", "line");

  bounds.append("path").attr("class", "line");
  bounds
    .append("g")
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);
  bounds.append("g").attr("class", "y-axis");

  const drawLine = (dataset) => {
    // 4. Create scales

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, yAccessor))
      .range([dimensions.boundedHeight, 0]);

    const freezingTemperaturePlacement = yScale(32);
    const freezingTemperatures = bounds
      .select(".freezing")
      .attr("x", 0)
      .attr("width", dimensions.boundedWidth)
      .attr("y", freezingTemperaturePlacement)
      .attr("height", dimensions.boundedHeight - freezingTemperaturePlacement);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataset, xAccessor))
      .range([0, dimensions.boundedWidth]);

    // 5. Draw data

    const lineGenerator = d3
      .line()
      .x((d) => xScale(xAccessor(d)))
      .y((d) => yScale(yAccessor(d)));

    const lastTwoPoints = dataset.slice(-2);
    const pixelsBetweenLastPoints =
      xScale(xAccessor(lastTwoPoints[1])) - xScale(xAccessor(lastTwoPoints[0]));
    /* now when updating the line, we can instantly shif it to the right to match the old line. see below `translateX`*/

    const line = bounds
      .select(".line")
      /* looks jerky ? then smoth the line transition  */
      //.transition()
      //.duration(1000)
      /* Ohh!, they wriggling around! instead of adding a new point at the end */
      /* that's because how path d attributes are a string of draw-to values */
      /* So, d3 transitioning each point to the next point at the same index! */
      /* the .attr() has no idea that we have just shifted our points down one index! */
      /* show do we shift it to the left instead ?
       * starting by figuring out how far we need to shift our line to the left
       * gab the last two points in the dataset and find the difference btw. their x values.
       * see above ...
       */
      .attr("d", lineGenerator(dataset))
      /* this shift should be invisible because at the same time we're shifting our x scale
       * to the left by the same amount.
       */
      .style("transform", `translateX(${pixelsBetweenLastPoints}px)`)

      /* now we can animate un-shifting the line to the left, to its normal position on the x axis */
      .transition()
      .duration(1000)
      .style("transform", `none`);

    // 6. Draw peripherals

    const yAxisGenerator = d3.axisLeft().scale(yScale);

    const yAxis = bounds.select(".y-axis").call(yAxisGenerator);

    const xAxisGenerator = d3.axisBottom().scale(xScale);

    const xAxis = bounds
      .select(".x-axis")
      /* looks jerky ? then smoth the axis transition  */
      .transition()
      .duration(600)
      .call(xAxisGenerator);
  };
  drawLine(dataset);

  // update the line every 1.5 seconds
  setInterval(addNewDay, 1500);
  function addNewDay() {
    /* the .. is using ES6 spread syntax to expand the dataset(minus the first point) */
    dataset = [...dataset.slice(1), generateNewDataPoint(dataset)];
    drawLine(dataset);
  }

  function generateNewDataPoint(dataset) {
    const lastDataPoint = dataset[dataset.length - 1];
    const nextDay = d3.timeDay.offset(xAccessor(lastDataPoint), 1);

    return {
      date: d3.timeFormat("%Y-%m-%d")(nextDay),
      temperatureMax: yAccessor(lastDataPoint) + (Math.random() * 6 - 3),
    };
  }
}
drawLineChart();
