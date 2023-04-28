/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */

function convertRatingToStars(rating) {
    let icons = "";

    for (let i = 0; i < rating; i += 1) {
        icons += "<span class=\"icon\"><i class=\"fas fa-star\"></i></span>";
    }
    return icons;
}

function getAvgRating(ratings) {
    let total = 0;
    let count = 0;

    ratings.forEach((item, index) => {
        total += item;
        count += 1;
    });

    return total / count;
}

async function getProfilePicture(id) {
    const profilepicture = await fetch(`${window.location.origin}/api/users/${id}/profilepicture`);
    if (profilepicture.status === 200) {
        const json = await profilepicture.json()
        return json
    }
    return ""
}

async function getAndSetProfilePicture(id) {
    const profilepicture = await getProfilePicture(id)
    if (profilepicture === "") {
        return "./images/placeholder.png";
    }
    return `data:${profilepicture.contentType};base64,${profilepicture.data}`;
}

async function populateProfilePictures() {
    const elements = document.querySelectorAll(".userId")
    console.log(elements)
    elements.forEach((element) => {
        const profilepictureDiv = upTo(element, "reviewProfilePicture")
        console.log(profilepictureDiv)
        const profilepicture = getProfilePicture(element.textContent)
        console.log(profilepicture);
        if (profilepicture === "") {
            profilepictureDiv.src = "./images/placeholder.png";
        }
        else {
            profilepictureDiv.src = `data:${profilepicture.contentType};base64,${profilepicture.data}`;
        }
    })
}

async function getReviews(placeDetails) {
    const place = await fetch(`${window.location.origin}/api/places/lat=${placeDetails.lat}lng=${placeDetails.lng}`);
    if (place.status === 200) {
        const placeJson = await place.json();
        const reviews = await fetch(`${window.location.origin}/api/places/${placeJson._id}/reviews`);

        if (reviews.status === 200) {
            const reviewsJson = await reviews.json();
            const template = document.querySelector("#review");
            const reviewDiv = document.querySelector("#reviewDiv");
            const ratings = [];
            for (const review of reviewsJson) {
                ratings.push(review.rating);
                const clone = template.content.cloneNode(true);
                clone.getElementById("userName").textContent = `${review.user.fname} ${review.user.lname}`;
                clone.getElementById("reviewProfilePicture").src = await getAndSetProfilePicture(review.user._id)
                clone.getElementById("reviewContent").textContent = review.content;
                clone.getElementById("reviewRating").innerHTML = convertRatingToStars(review.rating);
                clone.getElementById("reviewDate").textContent = review.date;
                reviewDiv.appendChild(clone)
            }
            const AvgRating = getAvgRating(ratings);
            document.getElementById("placeRating").innerHTML = convertRatingToStars(AvgRating);
        }

    }
}

function loadReviewForm(placeDetails) {
    document.getElementById("lat").value = placeDetails.lat;
    document.getElementById("lng").value = placeDetails.lng;
    document.getElementById("formPlaceName").value = placeDetails.placeName;
    document.getElementById("formPlaceAddress").value = placeDetails.placeAddress;
}

function loadPlaceDetails(placeDetails) {
    document.getElementById("placeDetails").style.display = "block";
    document.getElementById("placeName").innerHTML = placeDetails.placeName;
    document.getElementById("placeAddress").innerHTML = placeDetails.placeAddress;
}

function onMarkerClick(searchResult) {
    const reviewDiv = document.querySelector("#reviewDiv");
    while (reviewDiv.lastElementChild) {
        reviewDiv.removeChild(reviewDiv.lastElementChild);
    }

    const placeDetails = {
        placeName: searchResult.properties.PlaceName,
        placeAddress: searchResult.properties.Place_addr,
        lat: searchResult.latlng.lat,
        lng: searchResult.latlng.lng,
    };
    loadPlaceDetails(placeDetails);
    getReviews(placeDetails);
    if (document.querySelector("#new-review")) {
        loadReviewForm(placeDetails);
    }
}

async function createMap() {
    // Create Map object and set view to Ireland Center
    const keyrequest = await fetch(`${window.location.origin}/api/users/esrikey`);
    const apiKey = await keyrequest.json();
    const map = L.map("map").setView([53.44, -7.5], 6);
    const basemapEnum = "ArcGIS:Navigation";

    L.esri.Vector.vectorBasemapLayer(basemapEnum, {
        apiKey: apiKey,
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
                const option = L.DomUtil.create("option");
                option.value = category[0];
                option.innerHTML = category[1];
                select.appendChild(option);
            });

            return select;
        },

        onRemove: function () {
            // Nothing to do here
        },
    });

    L.control.placesSelect = function (opts) {
        return new L.Control.PlacesSelect(opts);
    };

    L.control
        .placesSelect({
            position: "topright",
        })
        .addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    function showPlaces(category) {
        L.esri.Geocoding.geocode({
            apikey: apiKey,
        })
            .category(category)
            .nearby(map.getCenter(), 10)

            .run((error, response) => {
                if (error) {
                    return;
                }

                response.results.forEach((searchResult) => {
                    const marker = L.marker(searchResult.latlng);
                    marker.addTo(layerGroup);
                    marker.bindPopup(`<b>${searchResult.properties.PlaceName}</b></br>${searchResult.properties.Place_addr}`);
                    marker.on("click", () => {
                        onMarkerClick(searchResult);
                    });
                });
            });
    }

    const select = document.getElementById("optionsSelect");
    select.addEventListener("change", () => {
        layerGroup.clearLayers();
        if (select.value !== "") {
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
                    lng: -7.5,
                },
            }),
        ],
    }).addTo(map);

    const results = L.layerGroup().addTo(map);

    searchControl.on("results", (data) => {
        console.log(data);
        results.clearLayers();

        for (let i = data.results.length - 1; i >= 0; i -= 1) {
            const marker = L.marker(data.results[i].latlng);

            const lngLatString = `${Math.round(data.results[i].latlng.lng * 100000) / 100000}, ${Math.round(data.results[i].latlng.lat * 100000) / 100000}`;
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

    return map;
}


function copyLatLng(lat, lng) {
    document.getElementById("stationLatitude").value = lat;
    document.getElementById("stationLongitude").value = lng;
}
