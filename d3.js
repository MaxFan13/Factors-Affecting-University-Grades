const margin = {top: 30, right: 30, bottom: 50, left: 40},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const svg = d3.select("#d3-chart").append("svg")
    .attr("width", width + margin.left + margin.right + 100)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const gradeColors = {
    A: "#268100",
    B: "#F8D70D",
    C: "#F10015"
};

const color = d3.scaleOrdinal()
    .domain(["A", "B", "C"])
    .range([gradeColors.A, gradeColors.B, gradeColors.C]);

d3.csv("activity_grades.csv").then(data => {
    data.forEach(d => {
        d.count = +d.count;
    });
    
    const gradeOrder = ["A", "B", "C"];
    
    const nestedData = Array.from(d3.group(data, d => d.Sports_Participation), ([key, values]) => {
        const total = d3.sum(values, d => d.count);
        values.sort((a, b) => gradeOrder.indexOf(a.Grades) - gradeOrder.indexOf(b.Grades));
        let cumulative = 0;
        values.forEach(d => {
            d.percentage = (d.count / total) * 100;
            d.cum0 = cumulative;
            cumulative += d.percentage;
            d.cum1 = cumulative;
        });
        return { key: key, values: values };
    });
    
    const x = d3.scaleBand()
        .domain(["High", "Medium", "Low"])
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
    
    // Chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Student Grades by Sports Participation Level (Stacked, %)");

    const groups = svg.selectAll(".group")
        .data(nestedData)
        .join("g")
        .attr("class", "group")
        .attr("transform", d => `translate(${x(d.key)}, 0)`);
    
    groups.selectAll("rect")
        .data(d => d.values)
        .join("rect")
        .attr("x", 0)
        .attr("y", d => y(d.cum1))
        .attr("width", x.bandwidth())
        .attr("height", d => y(d.cum0) - y(d.cum1))
        .attr("fill", d => color(d.Grades))
        .append("title")
        .text(d => `Grade: ${d.Grades}, Count: ${d.count}, Percentage: ${d.percentage.toFixed(1)}%`);
    
    groups.selectAll("text")
        .data(d => d.values)
        .join("text")
        .attr("x", x.bandwidth() / 2)
        .attr("y", d => y(d.cum1) + (y(d.cum0) - y(d.cum1)) / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .text(d => d.percentage.toFixed(1) + "%");
    
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + "%"));
    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Sports Participation Level");
    
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -30)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Percentage of Students");
    
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 0)`);
    
    gradeOrder.forEach((grade, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);
    
        legendRow.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", color(grade));
    
        legendRow.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(grade)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
    });
});
