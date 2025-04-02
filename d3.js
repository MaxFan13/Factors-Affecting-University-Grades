const margin = {top: 30, right: 30, bottom: 50, left: 40},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const svg = d3.select("#d3-chart").append("svg")
    .attr("width", width + margin.left + margin.right + 100)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("activity_grades.csv").then(data => {
    data.forEach(d => d.count = +d.count);

    const x0 = d3.scaleBand()
        .domain(["High", "Medium", "Low"])
        .range([0, width])
        .paddingInner(0.2);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Grades))])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)]).nice()
        .range([height, 0]);

    const gradeColors = {
        A: "#7572FF",
        B: "#E45142",
        C: "#49C89B"
    };
    
    const color = d3.scaleOrdinal()
        .domain(["A", "B", "C"])
        .range(["#7572FF", "#E45142", "#49C89B"]);
        

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Student Grades by Sports Participation Level");

    svg.append("g")
    .selectAll("g")
    .data(d3.group(data, d => d.Sports_Participation))
    .join("g")
        .attr("transform", d => `translate(${x0(d[0])},0)`)
    .selectAll("rect")
    .data(d => d[1])
    .join("rect")
        .attr("x", d => x1(d.Grades))
        .attr("y", d => y(d.count))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", d => color(d.Grades))
        .append("title")
        .text(d => `Grade: ${d.Grades}, Count: ${d.count}`);

    svg.append("g").call(d3.axisLeft(y));
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

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
        .text("Number of Students");

    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 0)`);

    const grades = [...new Set(data.map(d => d.Grades))];

    grades.forEach((grade, i) => {
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
