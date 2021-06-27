async function drawBars() {
  // 1. Access data
  const dataset = await d3.json("./../../my_weather_data.json");

  // 2. Create chart dimensions

  const width = 500;
  let dimensions = {
    width: width,
    height: width * 0.6,
    margin: {
      top: 30,
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

  // init static elements
  bounds.append("g").attr("class", "bins");
  bounds.append("line").attr("class", "mean");
  bounds
    .append("g")
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom - 10);

  const drawHistogram = (metric) => {
    const metricAccessor = (d) => d[metric];
    const yAccessor = (d) => d.length;

    // 4. Create scales

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, metricAccessor))
      .range([0, dimensions.boundedWidth])
      .nice();

    const binsGenerator = d3
      .bin()
      .domain(xScale.domain())
      .value(metricAccessor)
      .thresholds(12);

    const bins = binsGenerator(dataset);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(bins, yAccessor)])
      .range([dimensions.boundedHeight, 0])
      .nice();

    // 5. Draw data
    /* animate the bars when they leaving */
    const exitTransition = d3.transition().duration(600);
    const updateTransition = exitTransition.transition().duration(600);

    /* the animation was out of sync with the labels again!
      by doing so we can make a transition on the root document that can be used in multiple places.
      */
    /* const updateTransition = d3
      .transition()
      .duration(600)
      .ease(d3.easeBounceIn);
    console.log(updateTransition); */
    /* expand the _groups array and see that this transition is indeed targeting
     * the root <html> element.
     */

    const barPadding = 1;

    let binGroups = bounds.select(".bins").selectAll(".bin").data(bins);

    const oldBinGroups = binGroups.exit();
    oldBinGroups
      .selectAll("rect")
      .style("fill", "orangered")
      .transition(exitTransition)
      .attr("y", dimensions.boundedHeight)
      .attr("height", 0);

    oldBinGroups
      .selectAll("text")
      .transition(exitTransition)
      .attr("y", dimensions.boundedHeight);

    oldBinGroups.transition(exitTransition).remove();

    const newBinGroups = binGroups.enter().append("g").attr("class", "bin");

    newBinGroups
      .append("rect")
      .attr("height", 0)
      .attr("x", (d) => xScale(d.x0) + barPadding)
      .attr("y", dimensions.boundedHeight)
      .attr("width", (d) =>
        d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding])
      )
      /* we using .style() instead if .attr() because we need to fill the value to be an inline style
       * instead of an SVG attribute in order to override the CSS styles in styles.css  */
      .style("fill", "yellowgreen");

    newBinGroups
      .append("text")
      /* set the label's initial position to prevent them from flying in from the left */
      .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr("y", dimensions.boundedHeight);

    // update binGroups to include new points
    binGroups = newBinGroups.merge(binGroups);

    const barRects = binGroups
      .select("rect")
      /* we can use the .transition() methode on the d3 selection object
       * to transform the selection object into a d3 transition object.
       */
      //.transition() /* now we have two additional keys: _id and _name */
      /*  see also the __proto__ of the transition object,
       * which contains d3-specific methods
       * and the nested __proto__: Object contains native object methods such as toString().
       * we can see also some methods are ingerited form d3 selection object such as call() and each() */

      /* slow things down */
      //.duration(600)
      /* specify a timing func = CSS's transition-timing-func  to give the animation some life */
      // .ease(d3.easeBounceOut)

      /* update: to use the updateTransition instead of creating a new on */
      .transition(updateTransition)
      .attr("x", (d) => xScale(d.x0) + barPadding)
      .attr("y", (d) => yScale(yAccessor(d)))
      .attr("height", (d) => dimensions.boundedHeight - yScale(yAccessor(d)))
      .attr("width", (d) =>
        d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding])
      )
      .transition()
      .style("fill", "cornflowerblue");
    //console.log(barRects);

    const barText = binGroups
      .select("text")
      /* adding another transition to make the text transition with the bars */
      //.transition()
      //.duration(600)
      /* update: to use the updateTransition instead of creating a new on */
      .transition(updateTransition)
      .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr("y", (d) => yScale(yAccessor(d)) - 5)
      .text((d) => yAccessor(d) || "");

    const mean = d3.mean(dataset, metricAccessor);

    const meanLine = bounds
      .selectAll(".mean")
      /* use the updateTransition*/
      .transition(updateTransition)
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", -20)
      .attr("y2", dimensions.boundedHeight);

    // 6. Draw peripherals

    const xAxisGenerator = d3.axisBottom().scale(xScale);

    const xAxis = bounds
      .select(".x-axis")
      /* update: use the updateTransition*/
      .transition(updateTransition)
      .call(xAxisGenerator);

    const xAxisLabel = xAxis.select(".x-axis-label").text(metric);
  };

  const metrics = [
    "windSpeed",
    "moonPhase",
    "dewPoint",
    "humidity",
    "uvIndex",
    "windBearing",
    "temperatureMin",
    "temperatureMax",
  ];
  let selectedMetricIndex = 0;
  drawHistogram(metrics[selectedMetricIndex]);

  const button = d3.select("body").append("button").text("Change metric");

  button.node().addEventListener("click", onClick);
  function onClick() {
    selectedMetricIndex = (selectedMetricIndex + 1) % metrics.length;
    drawHistogram(metrics[selectedMetricIndex]);
  }
}
drawBars();
