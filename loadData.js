const datasetPath = "cereal.csv";

const parseData = d => ({
    name: d.name,
    mfr: d.mfr,
    calories: +d.calories,
    vitamins: +d.vitamins,
    rating: +d.rating,
});

const colors = {
    "A": "#e37676",
    "G": "#e8c285",
    "K": "#dbf595",
    "N": "#a1cc9f",
    "P": "#7bdbd2",
    "Q": "#7587bf",
    "R": "#ad63ba"
};

const manufacturerNames = {
    "A": "American Home Food Products",
    "G": "General Mills",
    "K": "Kellogg's",
    "N": "Nabisco",
    "P": "Post",
    "Q": "Quaker Oats",
    "R": "Ralston Purina"
};

d3.csv(datasetPath, parseData)
    .then(data => {
        data.sort((a, b) => a.name.localeCompare(b.name)); // Ordenar alfabéticamente

        const svg = d3.select("#chart");
        const width = svg.attr("width");
        const height = svg.attr("height");
        const radius = Math.min(width, height) / 2 - 130; // Ajustar el radio para evitar corte

        const arc = d3.arc()
            .innerRadius(radius - 100)
            .outerRadius(d => radius - 100 + d.rating * 2.5) // Ajustar el tamaño de las barras
            .startAngle((d, i) => (i * 2 * Math.PI) / data.length)
            .endAngle((d, i) => ((i + 1) * 2 * Math.PI) / data.length);

        const arcs = svg.append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`)
            .selectAll("path")
            .data(data)
            .enter().append("path")
            .attr("d", arc)
            .attr("fill", d => colors[d.mfr])
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .on("mouseover", (event, d) => {
                const tooltip = d3.select("#tooltip");
                tooltip
                    .style("visibility", "visible")
                    .html(`Nombre: ${d.name}<br>Calorías: ${d.calories}<br>Vitaminas: ${d.vitamins}`);
                
                const tooltipWidth = tooltip.node().offsetWidth;
                const tooltipHeight = tooltip.node().offsetHeight;
                tooltip
                    .style("top", `${(height / 2) - (tooltipHeight / 2)}px`)
                    .style("left", `${(width / 2) - (tooltipWidth / 2)}px`);
                
                arcs.attr("fill-opacity", o => o.mfr === d.mfr ? 1 : 0.2);
            })
            .on("mouseout", () => {
                d3.select("#tooltip").style("visibility", "hidden");
                arcs.attr("fill-opacity", 1);
            });

        // Leyenda
        const legend = d3.select("#legend");
        const uniqueMfrs = [...new Set(data.map(d => d.mfr))];
        uniqueMfrs.forEach(mfr => {
            const item = legend.append("div").attr("class", "legend-item");
            item.append("div")
                .attr("class", "legend-color")
                .style("background-color", colors[mfr]);
            item.append("span").text(manufacturerNames[mfr]);
        });
    })
    .catch(error => {
        console.log("Error al cargar el dataset:", error);
    });
