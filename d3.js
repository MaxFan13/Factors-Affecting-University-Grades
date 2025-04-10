const margin = {top: 30, right: 30, bottom: 50, left: 40},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const svg = d3.select("#d3-chart").append("svg")
    .attr("width", width + margin.left + margin.right + 100)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define your grade color mapping
const gradeColors = {
    A: "#7572FF",
    B: "#E45142",
    C: "#49C89B"
};

const color = d3.scaleOrdinal()
    .domain(["A", "B", "C"])
    .range([gradeColors.A, gradeColors.B, gradeColors.C]);

d3.csv("activity_grades.csv").then(data => {
    // Convert count values to numbers
    data.forEach(d => {
        d.count = +d.count;
    });
    
    // Define an order for the Grades (if you want a specific stacking order)
    const gradeOrder = ["A", "B", "C"];
    
    // Group the data by Sports_Participation and compute percentages and cumulative values for stacking
    const nestedData = Array.from(d3.group(data, d => d.Sports_Participation), ([key, values]) => {
        const total = d3.sum(values, d => d.count);
        // Sort by the defined grade order to keep stacking consistent
        values.sort((a, b) => gradeOrder.indexOf(a.Grades) - gradeOrder.indexOf(b.Grades));
        let cumulative = 0;
        values.forEach(d => {
            d.percentage = (d.count / total) * 100;  // Percentage of this grade within the group
            d.cum0 = cumulative;                     // Starting cumulative percentage
            cumulative += d.percentage;
            d.cum1 = cumulative;                     // Ending cumulative percentage
        });
        return { key: key, values: values };
    });
    
    // Define an x-scale for the Sports_Participation groups.
    // Adjust these domain values if your data uses different names.
    const x = d3.scaleBand()
        .domain(["High", "Medium", "Low"])
        .range([0, width])
        .padding(0.2);

    // Define a y-scale for percentage (0% at the bottom, 100% at the top)
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
    
    // Append one group per Sports_Participation level and position it horizontally
    const groups = svg.selectAll(".group")
        .data(nestedData)
        .join("g")
        .attr("class", "group")
        .attr("transform", d => `translate(${x(d.key)}, 0)`);
    
    // Create stacked bar segments for each grade
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
    
    // Append percentage text in the center of each segment
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
    
    // Add the y-axis with percentage tick format
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + "%"));
    
    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Sports Participation Level");
    
    // Y-axis label
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -30)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Percentage of Students");
    
    // Legend for Grades
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
