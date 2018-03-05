

var AllAirline = [];
var currentData = [];
var flightData;

var format = function(d){
    d = d / 1000
    return d3.format('.0f')(d) + 'K';
}

var map = d3.geomap.choropleth()
    .geofile('../d3-geomap/topojson/countries/USA.json')
    .projection(d3.geo.albersUsa)
    // .column(the colum with flight departure data)
    .column('a_sum')
    .format(format)
    .unitId('fips')
    .scale(750)
    .legend(true);

d3.queue().defer(d3.csv, "../data/flightFip.csv")
    .await(ready)

d3.select('#map').call(map.draw, map);

function ready(error, flights) {
    flightData = flights;
    flights.forEach(element => {
        if (AllAirline.indexOf(element.carrier_name) < 0) {
            AllAirline.push(element.carrier_name)
        }
    });

    var btngroup = document.querySelector("#btns");
    var currentTitle = document.querySelector("#currentAirline");
    AllAirline.forEach(e => {
        var btn = document.createElement("button")
        btn.type = "button";
        btn.classList.add("btn");
        btn.classList.add("btn-outline-secondary")
        btn.innerHTML = e;
        btn.name = e;
        btn.addEventListener("click", () => {filterAirline(e, display)
            currentTitle.innerHTML = e
        })
        btngroup.appendChild(btn);
    })
}

function filterAirline(airlineName, _callBack) {
    currentData = [];
    flightData.forEach(e => {
        if (e.carrier_name == airlineName) {
            currentData.push(e)
        }
    })
    display(currentData);
}

function display(data) {
    document.querySelector("#map").innerHTML = "";
    d3.select('#map')
        .datum(data)
        .call(map.draw, map);
}