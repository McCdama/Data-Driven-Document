"use strict";

function createEvent() {
  var rectColors, rects;
  return regeneratorRuntime.async(function createEvent$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          rectColors = ["yellowgreen", "cornflowerblue", "seagreen", "slateblue"]; // create and bind data to our rects

          rects = d3.select("#svg").selectAll(".rect").data(rectColors).enter().append("rect").attr("height", 100).attr("width", 100).attr("x", function (d, i) {
            return i * 110;
          }).attr("fill", "lightgrey"); // code here

          rects.on("mouseenter", function (datum, index, nodes) {
            d3.select(this).style("fill", datum);
            console.log({
              datum: datum,
              index: index,
              nodes: nodes
            });
            console.log(this);
          });

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
}

createEvent();