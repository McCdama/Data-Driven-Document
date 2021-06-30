async function drawScatter() {
  // 1. Access data

  const dataset = await d3.json("./../../my_weather_data.json");

  const xAccessor = (d) => d.dewPoint;
  const yAccessor = (d) => d.humidity;

  // 2. Create chart dimensions

  const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);
  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
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

  // 4. Create scales

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  const drawDots = (dataset) => {
    // 5. Draw data

    const dots = bounds.selectAll("circle").data(dataset, (d) => d[0]);

    const newDots = dots.enter().append("circle");

    const allDots = newDots
      .merge(dots)
      .attr("cx", (d) => xScale(xAccessor(d)))
      .attr("cy", (d) => yScale(yAccessor(d)))
      .attr("r", 4);

    const oldDots = dots.exit().remove();
  };
  drawDots(dataset);

  // 6. Draw peripherals

  const xAxisGenerator = d3.axisBottom().scale(xScale);

  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);

  const xAxisLabel = xAxis
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom - 10)
    .html("dew point (&deg;F)");

  const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(4);

  const yAxis = bounds.append("g").call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 10)
    .text("relative humidity");

  // 7. Set up interactions
  bounds
    .selectAll("circle")
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseleave);

  const tooltip = d3.select("#tooltip");
  /* 1- display metric on the x axis (dew point)
   * 2- the metric on the y axis (humidity)
   * 3- also.. define also a string formatter and use that to set the text of the relevant </span> in the tooltip.
   */
  function onMouseEnter(datum, index) {
    //console.log(index);
    //console.log(datum);
    const formatHumidity = d3.format(".2f");
    tooltip.select("#humidity").text(formatHumidity(yAccessor(index))); // Fixed: not passing the (yAccessor(datum))!

    const formatDewPoint = d3.format(".2f");
    tooltip.select("#dew-point").text(formatDewPoint(xAccessor(index))); // Fixed: not passing the (xAccessor(datum))!

    const dateParser = d3.timeParse("%Y-%m-%d");
    //console.log(dateParser(index.date)); // Fixed: not passing the (datum.date)!
    /* see: https://github.com/d3/d3-time-format */
    const formatDate = d3.timeFormat("%B %A %-d, %Y");
    //console.log(formatDate(dateParser(index.date))); // Much better

    /* plug them in the tooltip */
    tooltip.select("#date").text(formatDate(dateParser(index.date)));
    /* grab the x and y value of the dot, offset by the TOP and LEFT margins. */
    const x = xScale(xAccessor(index)) + dimensions.margin.left; // Fixed: not passing the (xAccessor(datum))!
    const y = yScale(yAccessor(index)) + dimensions.margin.top; // Fixed: not passing the (yAccessor(datum))!

    tooltip.style(
      "transform",
      `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
    );
    tooltip.style("opacity", 1);
    /* EXTRA: Tooltip Dot on pointer event */
    const dayDot = bounds
      .append("circle")
      .attr("class", "tooltipDot")
      .attr("cx", xScale(xAccessor(index)))
      .attr("cy", yScale(yAccessor(index)))
      .attr("r", 7)
      .style("fill", "maroon")
      .style("pointer-events", "none");
  }
  function onMouseleave() {
    d3.selectAll(".tooltipDot").remove();
    tooltip.style("opacity", 0);
  }
}
drawScatter();
