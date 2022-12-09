// data files
var DATA_PATH = "data/heatmap_data.csv";
var DATA_PCA_PATH = "data/pca_data.csv";

// selects mapping

var lastVariableVisited = "";
var colorsOfLastVisited = [];
var lastColorsVisited = "";
var selectedCountry = "";
var countryInScatter = "";

// global colors

var myColor;

// heatmap

// set the dimensions and margins of the graph
var margin1 = { top: 10, right: 50, bottom: 150, left: 250 },
  width1 = 850 - margin1.left - margin1.right,
  height1 = 550 - margin1.top - margin1.bottom;

// append the svg object to the body of the page
var svg1 = d3
  .select("#heatmap_dataviz")
  .append("svg")
  .attr("width", width1 + margin1.left + margin1.right)
  .attr("height", height1 + margin1.top + margin1.bottom)
  .append("g")
  .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

// scatter

// set the dimensions and margins of the graph
var margin2 = { top: 10, right: 30, bottom: 100, left: 60 },
  width2 = 400 - margin2.left - margin2.right,
  height2 = 550 - margin2.top - margin2.bottom;

// append the svg object to the body of the page
var svg2 = d3
  .select("#scatterplot_dataviz")
  .append("svg")
  .attr("width", width2 + margin2.left + margin2.right)
  .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

// Read the heatmap data

d3.csv(DATA_PATH, function (data) {
  // for both

  // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
  var myGroups = d3
    .map(data, function (d) {
      return d.group;
    })
    .keys()
    .sort();
  var myVars = d3
    .map(data, function (d) {
      return d.variable;
    })
    .keys()
    .sort(); //.reverse();

  // heatmap

  // Build X scales and axis:
  var x1 = d3.scaleBand().range([0, width1]).domain(myGroups).padding(0.05);
  svg1
    .append("g")
    .style("font-size", 10)
    .attr("transform", "translate(0," + height1 + ")")
    .call(d3.axisBottom(x1).tickSize(0))
    .selectAll("text")
    .attr("transform", "translate(5,5)rotate(65)")
    .style("text-anchor", "start")
    .select(".domain")
    .remove();

  // Build Y scales and axis:
  var y1 = d3.scaleBand().range([height1, 0]).domain(myVars).padding(0.05);
  svg1
    .append("g")
    .style("font-size", 10)
    .call(d3.axisLeft(y1).tickSize(0))
    .select(".domain")
    .remove();

  // Build color scale
  myColor = d3
    .scaleSequential()
    .interpolator(d3.interpolateRdBu)
    .domain([-5, 5]);

  function verticalRect(x, rectWidth) {
    svg1
      .append("rect")
      .style("stroke", "black")
      .style("stroke-width", 2)
      .style("fill", "none")
      .attr("id", "rektokvir")
      .attr("x", x)
      .attr("y", 0)
      .attr("height", height1)
      .attr("width", rectWidth)
      .attr("rx", 4)
      .attr("ry", 4);
  }

  function horizontalRect(y, rectHeight) {
    svg1
      .append("rect")
      .style("stroke", "black")
      .style("stroke-width", 2)
      .style("fill", "none")
      .attr("id", "rektokvir")
      .attr("x", 0)
      .attr("y", y)
      .attr("height", rectHeight)
      .attr("width", width1)
      .attr("rx", 4)
      .attr("ry", 4);
  }

  // create a tooltip
  var tooltip = d3
    .select("#heatmap_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("padding", "5px");

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function (d) {
    var x_coordinate = this.x.animVal.value;
    var y_coordinate = this.y.animVal.value;
    var height_of_rect = this.height.animVal.value;
    var width_of_rect = this.width.animVal.value;

    verticalRect(x_coordinate, width_of_rect);
    horizontalRect(y_coordinate, height_of_rect);

    tooltip.style("opacity", 1);

    //d3.select(this).style("stroke", "black").style("opacity", 1);

    // store last variable in heatmap and colors of that variable
    lastVariableVisited = d.variable;
    colorsOfLastVisited = data.filter((alld) => alld.variable == d.variable);

    // store country
    var heatCountry = d3.select("#heat_country").property("value", d.group);
    heatCountry.on("mouseover")();

    // TODO call event to update colors
    //console.log(filteredRow)
    //var colors = data.map(d=>console.log(d.color))
    // console.log(lastVariableVisited);
  };
  var mousemove = function (d) {
    tooltip
      .html(`The "${d.variable}" in ${d.group} is: ${d.value}`)
      .style("left", d3.mouse(this)[0] + 70 + "px")
      .style("top", d3.mouse(this)[1] + "px");
  };
  var mouseleave = function (d) {
    d3.selectAll("#rektokvir").remove();
    tooltip.style("opacity", 0);
    d3.select(this).style("stroke", "none").style("opacity", 1);

    // clear country
    var heatCountry = d3.select("#heat_country").property("value", "");
    heatCountry.on("mouseleave")();
  };

  // add the squares
  svg1
    .selectAll()
    .data(data, function (d) {
      return d.group + ":" + d.variable;
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x1(d.group);
    })
    .attr("y", function (d) {
      return y1(d.variable);
    })
    //.attr("class", function (d) {
    //  return d.group;
    //})
    //.attr("class", function (d) {
    //  return d.variable;
    //})
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", x1.bandwidth())
    .attr("height", y1.bandwidth())
    .attr("id", function (d) {
      return `${d.group} - ${d.variable}`;
    })
    .style("fill", function (d) {
      return myColor(d.color);
    })
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 1)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  d3.select("#scatter_country").on("mouseover", function () {
    var scatterCountry = d3.select("#scatter_country").property("value");
    // console.log(`country in heat received: ${scatterCountry}`);
    // console.log(`current row is: ${lastVariableVisited}`);

    // find matching rect from scatter plot country and last variable
    var [thisRect] = data.filter(
      (alld) =>
        alld.variable == lastVariableVisited && alld.group == scatterCountry
    );
    var thisX = x1(thisRect.group);
    var thisY = y1(thisRect.variable);
    var thisHeight = y1.bandwidth();

    /// add horizontla frame
    horizontalRect(thisY, thisHeight);

    // find rect and add frame
    d3.select("#heatmap_dataviz")
      .selectAll("rect")
      .filter(function () {
        return (
          d3.select(this).attr("x") == thisX &&
          d3.select(this).attr("y") == thisY
        );
      })
      .style("stroke", "black")
      .style("stroke-width", 2)
      .style("opacity", 1);
  });

  d3.select("#scatter_country").on("mouseleave", function () {
    // remove horizontal frame
    d3.selectAll("#rektokvir").remove();

    // remove rect frame
    d3.select("#heatmap_dataviz")
      .selectAll("rect")
      .style("stroke", "none")
      .style("stroke-width", 0)
      .style("opacity", 1);
  });
});

// Read the scatter data

//Read the data
d3.csv(DATA_PCA_PATH, function (data) {
  // Add X axis
  var x2 = d3.scaleLinear().domain([-10, 10]).range([0, width2]);
  svg2
    .append("g")
    .attr("transform", "translate(0," + height2 + ")")
    .call(d3.axisBottom(x2));

  // Add Y axis
  var y2 = d3.scaleLinear().domain([-4, 4]).range([height2, 0]);
  svg2.append("g").call(d3.axisLeft(y2));

  // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
  // Its opacity is set to 0: we don't see it by default.
  var tooltip2 = d3
    .select("#scatterplot_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip2")
    .style("background-color", "white")
    .style("padding", "10px");

  // A function that change this tooltip when the user hover a point.
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  var mouseover = function (d) {
    const countryInput = d3.select("#country");
    countryInput.property("value", d.Country);

    tooltip2.style("opacity", 1);

    d3.select(this)
      .style("stroke-width", 4)
      .style("stroke", "black")
      .style("opacity", 1);

    var scatterCountry = d3
      .select("#scatter_country")
      .property("value", d.Country);
    scatterCountry.on("mouseover")();
  };

  var mousemove = function (d) {
    tooltip2
      .html("The selected country is: " + d.Country)
      .style("left", d3.mouse(this)[0] + 90 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", d3.mouse(this)[1] + "px");
  };

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var mouseleave = function (d) {
    const countryInput = d3.select("#country");
    countryInput.property("value", "Australia");

    tooltip2.transition().duration(200).style("opacity", 0);

    d3.select(this)
      .style("stroke-width", 0)
      .style("stroke", "none")
      .style("opacity", 1);

    // remove scatter country
    var scatterCountry = d3.select("#scatter_country").property("value", "");
    scatterCountry.on("mouseleave")();
  };

  // Add dots
  svg2
    .append("g")
    .selectAll("dot")
    .data(
      data.filter(function (d, i) {
        return i < 50;
      })
    ) // the .filter part is just to keep a few dots on the chart, not all of them
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x2(d.PC1);
    })
    .attr("cy", function (d) {
      return y2(d.PC2);
    })
    .attr("r", 7)
    .style("fill", "#69b3a2")
    .style("opacity", 1)
    .style("stroke", "white")
    .attr("class", function (d) {
      return d.Country;
    })
    .attr("data-country", function (d) {
      return d.Country;
    })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  d3.select("#heat_country").on("mouseover", function () {
    var heatCountry = d3.select("#heat_country").property("value");
    //console.log(heatCountry)

    const [foundCountry] = data.filter((d) => d.Country == heatCountry);
    //console.log(foundCountry)

    pc1 = x2(foundCountry.PC1);
    pc2 = y2(foundCountry.PC2);
    //console.log(x2(d.PC1))
    // console.log(pc1)

    d3.select("#scatterplot_dataviz")
      .selectAll("circle")
      .filter(function () {
        return d3.select(this).attr("cx") == pc1;
      })
      .style("stroke-width", 4)
      .style("stroke", "black");

    // color countries
    colorsOfLastVisited.forEach((item) => {
      const country = item.group;
      const color = myColor(item.color);

      d3.select("#scatterplot_dataviz")
        .selectAll("circle")
        .filter(function () {
          return d3.select(this).attr("data-country") == country;
        })
        .style("fill", color)
        .style("opacity", 1);
    });
  });

  d3.select("#heat_country").on("mouseleave", function () {
    // console.log("napustion sam");
    d3.select("#scatterplot_dataviz")
      .selectAll("circle")
      .style("stroke-width", 0)
      .style("stroke", "none");
  });
});
