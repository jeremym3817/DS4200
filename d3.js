d3.csv("CSV_FILE/Superstore.csv").then(data => {
    data.forEach(d => d.Sales = +d.Sales);

    // Group sales by category and ship mode
    const nestedData = d3.rollup(
        data,
        v => d3.sum(v, d => d.Sales),
        d => d.Category,
        d => d["Ship Mode"]
    );

    // Extract categories and shipping mode
    const categories = Array.from(nestedData.keys());
    const shipModes = ["Standard Class", "Second Class", "First Class", "Same Day"];

    // Change data into an array
    const barData = [];
    nestedData.forEach((shipMap, category) => {
        shipMap.forEach((sales, shipMode) => {
            barData.push({ Category: category, ShipMode: shipMode, Sales: sales });
        });
    });

    // Chart dimensions and margins
    const margin = { top: 40, right: 40, bottom: 70, left: 70 },
          width = 700,
          height = 400;

    // SVG container
    const svg = d3.select("#barplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x0 = d3.scaleBand()
        .domain(categories)
        .range([0, width])
        .paddingInner(0.2);

    const x1 = d3.scaleBand()
        .domain(shipModes)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.Sales) * 1.1])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(shipModes)
        .range(["#ffcc00", "#ff9900", "#ff6600", "#ff3300"]);

    // X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    // Y-axis
    svg.append("g").call(d3.axisLeft(y));

    // Grouped bars
    svg.selectAll("g.category")
        .data(categories)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d)},0)`)
        .selectAll("rect")
        .data(category => shipModes.map(mode => {
            const entry = barData.find(d => d.Category === category && d.ShipMode === mode);
            return { ShipMode: mode, Sales: entry ? entry.Sales : 0 };
        }))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.ShipMode))
        .attr("y", d => y(d.Sales))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.Sales))
        .attr("fill", d => color(d.ShipMode));

    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Shipping Class for Category");

    // Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Shipping Volume");

    // Legend
    const legend = svg.selectAll(".legend")
        .data(shipModes)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend.append("rect")
        .attr("x", width - 15)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => color(d));

    legend.append("text")
        .attr("x", width - 20)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .text(d => d);
});
