const CEREAL = "cereal.csv";

const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");
const SVG3 = d3.select("#vis-3").append("svg");

const WIDTH_VIS_1 = 800;
const HEIGHT_VIS_1 = 400;

const WIDTH_VIS_2 = 800;
const HEIGHT_VIS_2 = 400;

const WIDTH_VIS_3 = 800;
const HEIGHT_VIS_3 = 400;
const margins3 = [30, 30, 30, 30]; //LEFT, RIGHT, TOP, BOTTOM

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);
SVG3.attr("width", WIDTH_VIS_3).attr("height", HEIGHT_VIS_3);

crearVis1();
crearVis3();

function crearVis1() {
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
}

function crearVis3() {
    d3.csv(CEREAL, d3.autoType).then(cereals => {
        console.log(cereals);

        // Define the number of bins
        const numBins = 10;

        // Create bins for sugars
        const sugarExtent = d3.extent(cereals, d => d.sugars);
        const ratingExtent = d3.extent(cereals, d => d.rating);

        const sugarBins = d3.histogram()
            .domain(sugarExtent)
            .thresholds(d3.range(sugarExtent[0], sugarExtent[1], (sugarExtent[1] - sugarExtent[0]) / numBins))
            (cereals.map(d => d.sugars));

        const ratingBins = d3.histogram()
            .domain(ratingExtent)
            .thresholds(d3.range(ratingExtent[0], ratingExtent[1], (ratingExtent[1] - ratingExtent[0]) / numBins))
            (cereals.map(d => d.rating));

        // Create a 2D array to count cereals in each bin
        const cerealCount = Array.from({ length: numBins }, () => Array(numBins).fill(0));

        cereals.forEach(cereal => {
            const sugarIndex = sugarBins.findIndex(bin => bin.x0 <= cereal.sugars && cereal.sugars < bin.x1);
            const ratingIndex = ratingBins.findIndex(bin => bin.x0 <= cereal.rating && cereal.rating < bin.x1);

            if (sugarIndex >= 0 && ratingIndex >= 0) {
                cerealCount[sugarIndex][ratingIndex]++;
            }
        });

        // Scale for x axis (sugar)
        const x3 = d3.scaleBand()
            .domain(d3.range(numBins))
            .range([margins3[0], WIDTH_VIS_3 - margins3[1]])
            .padding(0.01);
        SVG3.append("g")
            .attr("transform", `translate(0, ${HEIGHT_VIS_3 - margins3[3]})`)
            .call(d3.axisBottom(x3).tickFormat((d, i) => {
                const bin = sugarBins[i];
                return `${Math.round(bin.x0)} - ${Math.round(bin.x1)}`;
            }));

        // Scale for y axis (rating)
        const y3 = d3.scaleBand()
            .domain(d3.range(numBins))
            .range([HEIGHT_VIS_3 - margins3[2], margins3[3]])
            .padding(0.01);
        SVG3.append("g")
            .attr("transform", `translate(${margins3[0]},0)`)
            .call(d3.axisLeft(y3).tickFormat((d, i) => {
                const bin = ratingBins[i];
                return `${Math.round(bin.x0)} - ${Math.round(bin.x1)}`;
            }));

        // Scale for color
        const colorMap = d3.scaleLinear()
            .domain([0, d3.max(cerealCount.flat())])
            .range(["white", "#DA4167"]);

        // Draw rectangles
        SVG3.selectAll("rect")
            .data(cerealCount.flat().map((count, i) => ({
                x: i % numBins,
                y: Math.floor(i / numBins),
                count: count
            })))
            .join("rect")
            .attr("x", d => x3(d.x))
            .attr("y", d => y3(d.y))
            .attr("width", x3.bandwidth())
            .attr("height", y3.bandwidth())
            .style("fill", d => colorMap(d.count));
    });
}
