async function createMap() {
    // TODO: Add validators and error checking for the api key request
    // TODO: Dont forget to update the URL for the key request to your own url when this is hosted online
    
    // Create Map object and set view to Ireland Center
    const keyrequest = await fetch("http://localhost:3000/api/users/esrikey")
    const apiKey = await keyrequest.json()
    const map = L.map("map").setView([53.44, -7.5], 6);
    const basemapEnum = "ArcGIS:Navigation";

    L.esri.Vector.vectorBasemapLayer(basemapEnum, {
        apiKey: apiKey
    }).addTo(map);

    L.Control.PlacesSelect = L.Control.extend({
        onAdd: function () {

            const placeCategories = [
                ["", "Choose a category..."],
                ["Bar or Pub", "Bar"],
                ["Food", "Restaurant"],
                ["Hotel", "Hotel"],
            ];

            const select = L.DomUtil.create("select", "");
            select.setAttribute("id", "optionsSelect");
            select.setAttribute("style", "font-size: 16px;padding:4px 8px;");

            placeCategories.forEach((category) => {
                let option = L.DomUtil.create("option");
                option.value = category[0];
                option.innerHTML = category[1];
                select.appendChild(option);
            });

            return select;
        },

        onRemove: function () {
            // Nothing to do here
        }
    })

    L.control.placesSelect = function (opts) {
        return new L.Control.PlacesSelect(opts);
    };

    L.control.placesSelect({
        position: "topright"
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);


    function showPlaces(category) {
        L.esri.Geocoding
            .geocode({
                apikey: apiKey
            })
            .category(category)
            .nearby(map.getCenter(), 10)

            .run((error, response) => {
                console.log(response)

                if (error) {
                    return;
                }

                response.results.forEach((searchResult) => {
                    L.marker(searchResult.latlng)
                        .addTo(layerGroup)
                        .bindPopup(`<b>${searchResult.properties.PlaceName}</b></br>${searchResult.properties.Place_addr}`);
                });
            })

    }

    const select = document.getElementById("optionsSelect");
    select.addEventListener("change", () => {
        layerGroup.clearLayers();
        if (select.value !== "") {
            console.log(select.value)
            showPlaces(select.value);
        }
    });

    const searchControl = L.esri.Geocoding.geosearch({
        position: "bottomleft",
        placeholder: "Enter an address or place e.g. 1 York St",
        useMapBounds: false,

        providers: [
            L.esri.Geocoding.arcgisOnlineProvider({
              apikey: apiKey,
              nearby: {
                lat: 53.44,
                lng: -7.5
              }
            })
          ]
      }).addTo(map);

      const results = L.layerGroup().addTo(map);

      searchControl.on("results", (data) => {
        console.log(data)
        results.clearLayers();

        for (let i = data.results.length - 1; i >= 0; i--) {
            const marker = L.marker(data.results[i].latlng);

            const lngLatString = `${Math.round(data.results[i].latlng.lng * 100000) / 100000}, ${
                Math.round(data.results[i].latlng.lat * 100000) / 100000
              }`;
              marker.bindPopup(`<b>${lngLatString}</b><p>${data.results[i].properties.LongLabel}</p>`);
  
            results.addLayer(marker);

            marker.openPopup();
          }

      });

    // sets the style of the Map
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 16,
        attribution: "© OpenStreetMap",
    }).addTo(map);


    // On click event
    return map
}

function addMarker(map) {
    const clickMarker = L.marker([51.5, -0.09]).addTo(map);;

    const htmlContent = `
    <div class="ui left labeled button" tabindex="0">
        <a class="ui basic right pointing label">
        <section>
        <b>Lat</b>: Latitude, <b>Lng:</b>Longitude
        </section>
        </a>
        <button>
        Copy
        </button>
    </div>`

    clickMarker.bindPopup(htmlContent)
}


function copyLatLng(lat, lng) {
    document.getElementById("stationLatitude").value = lat
    document.getElementById("stationLongitude").value = lng
}