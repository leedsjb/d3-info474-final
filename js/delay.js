// https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4

var margin = { top: 20, right: 20, bottom: 30, left: 45 },
    width = 650 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);

var y = d3.scaleLinear()
    .range([height, 0]);

var svg = d3.select("#barvis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.queue().defer(d3.csv, "../data/DelaySum.csv")
    .await(done)

var allDelayData;
var header = ['carrier', 'weather', 'aviation', 'security', 'late'];
var allAirline = [];
var currentDelayData = [];
var delayRawNum = [];

function done(error, delays) {
    allDelayData = delays
    delays.forEach(e => {
        if (allAirline.indexOf(e.carrier_name) < 0) {
            allAirline.push(e.carrier_name)
        }
    });

    var btngroup = document.querySelector("#barbtns");
    // var currentTitle = document.querySelector("#currentAirline");
    allAirline.forEach(e => {
        var btn = document.createElement("button")
        btn.type = "button";
        btn.classList.add("btn");
        btn.classList.add("btn-outline-secondary")
        btn.innerHTML = e;
        btn.name = e;
        btn.addEventListener("mouseover", () => {filterAirlineDelay(e, displayBar)
        })
        btngroup.appendChild(btn);
    })


    filterAirlineDelay("Alaska Airlines Inc.", displayBar);

}

function filterAirlineDelay(airlineName, _callBack) {
    delayRawNum = [];
    currentDelayData = [];
    allDelayData.forEach(e => {
        if (e.carrier_name == airlineName) {
            header.forEach(h => {
                delayRawNum.push(e[h])
            })
        }
    })

    for(let i = 0; i < delayRawNum.length; i++){
        // currentDelayData.push({[header[i]]: delayRawNum[i]});
        currentDelayData.push({"cause": header[i], "num": +delayRawNum[i]});
    }

    currentDelayData.columns = ["cause","num"];

    console.log(currentDelayData)

    _callBack(currentDelayData);
}

function displayBar(data) {
    svg.selectAll("*").remove();
    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d){return d.cause}));
    y.domain([0, d3.max(data, function(d){return d.num})]);

    svg.selectAll(".bar")
        .data(data) //need to pass data format
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d){return x(d.cause)})
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(d.num)})
        .attr("height", function (d) { return height - y(d.num); })
        .attr("fill","#3182bd");
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
}
