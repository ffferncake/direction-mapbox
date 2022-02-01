import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import * as MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import {
  // bbox,
  bboxPolygon,
  buffer,
  booleanDisjoint,
} from "@turf/turf";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import {
  MapboxStyleDefinition,
  MapboxStyleSwitcherControl,
} from "mapbox-gl-style-switcher";
import "mapbox-gl-style-switcher/styles.css";

var polyline = require("@mapbox/polyline");
var bbox = require("@turf/turf");

//import polyline from "https://cdnjs.cloudflare.com/ajax/libs/mapbox-polyline/1.1.1/polyline.js";
// import Geocoder from "react-mapbox-gl-geocoder";
// import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmVybmNha2UiLCJhIjoiY2txajcyaWwwMDh2bjMwbngwM2hnaGdjZSJ9.w6HwEX8hDJzyYKOC7X7WHg";

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(100.4518);
  const [lat, setLat] = useState(13.7563);
  const [zoom, setZoom] = useState(11);
  // const reports = document.getElementById("reports");

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-preview-day-v4",
      center: [lng, lat],
      zoom: zoom,
      flyTo: true,
    });
    /* basemap swi */
    map.current.addControl(
      new MapboxStyleSwitcherControl({
        styles: [
          {
            uri: "mapbox://styles/mapbox/outdoors-v11",
            title: "Map",
            className: "style-streets",
          },
          {
            uri: "mapbox://styles/mapbox/satellite-v9",
            title: "Satellite",
            className: "style-satellite",
          },
        ],
      })
    );
    map.current.on("load", function () {
      map.current.addControl(new MapboxStyleSwitcherControl());
    });

    /* find user location */
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: true, // Do not use the default marker style
      placeholder: "Search", // Placeholder text for the search bar
    });
    // Add the geocoder to the map
    map.current.addControl(geocoder);
    // document.getElementById("geocoder").appendChild(geocoder.onAdd(map.current));

    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric",
      profile: "mapbox/driving",
      alternatives: true,
      geometries: "geojson",
      controls: {
        instructions: true,
      },
      flyTo: true,
    });
    map.current.scrollZoom.enable();
    map.current.addControl(directions);

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    const clearances = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [100.524, 13.807],
          },
          properties: {
            clearance: "13' 2",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [100.434, 13.804],
          },
          properties: {
            clearance: "13' 7",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [100.438, 13.832],
          },
          properties: {
            clearance: "13' 7",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [100.455, 13.736],
          },
          properties: {
            clearance: "12' 0",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [100.55946, 13.30213],
          },
          properties: {
            clearance: "13' 6",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [100.529, 13.738],
          },
          properties: {
            clearance: "13' 6",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [100.548, 13.831],
          },
          properties: {
            clearance: "11' 6",
          },
        },
      ],
    };
    const incident = "https://event.longdo.com/feed/json";
    getData();

    async function getData() {
      let mygeojson = { type: "FeatureCollection", features: [] };
      await fetch(incident)
        .then((response) => response.json())
        .then((data) => {
          for (let point of data) {
            let coordinate = [
              parseFloat(point.longitude),
              parseFloat(point.latitude),
            ];
            let properties = point;
            // delete properties.longitude;
            // delete properties.latitude;
            let feature = {
              type: "Feature",
              geometry: { type: "Point", coordinates: coordinate },
              properties: properties,
            };
            mygeojson.features.push(feature);
            // const marker2 = new mapboxgl.Marker()
            //   .setLngLat([point.longitude, point.latitude])
            //   .addTo(map.current);

            const popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 25,
            });

            // create the marker
            // new mapboxgl.Marker()
            //   .setLngLat([point.longitude, point.latitude])
            //   .setPopup(popup) // sets a popup on this marker
            //   .addTo(map.current);

            map.current.on("mouseenter", "mygeojson", (e) => {
              // Change the cursor style as a UI indicator.
              map.current.getCanvas().style.cursor = "pointer";

              // Copy coordinates array.
              const coordinates = [point.longitude, point.latitude];
              popup
                .setLngLat(coordinates)
                .setHTML(
                  `<div id = "popup-container"><table style= font-family: "Noto Sans Thai", sans-serif;>
                      <tr>
                        <th>title</th>
                        <th>title_en</th>
                        <th>description</th>
                      </tr>
                      <tr>
                        <td>${properties.title}</td>
                        <td>${properties.title_en}</td>
                        <td>${properties.description}</td>
                      </tr>
                  </table>
                  <center><img src = ${properties.images} width="50%" height="50%"/></center>
                  </div>`
                  // `<div id = "popup-container"><table><h3 style="text-align:center"; font-family: "Noto Sans Thai", sans-serif;><td>ชื่อ<tr>${properties.title}</tr></td><td>ชื่ออิ้ง<tr>${properties.title_en}</tr></td></h3><table></div>`
                )
                .addTo(map.current);
            });

            map.current.on("mouseleave", "mygeojson", () => {
              map.current.getCanvas().style.cursor = "";
              popup.remove();
            });
            // const marker2 = new mapboxgl.Marker()
            //   .setLngLat([point.longitude, point.latitude])
            //   .addTo(map.current);
          }
        });
      console.log(mygeojson);
      // After the last frame rendered before the map enters an "idle" state.

      const obstacle = buffer(mygeojson, 0.25, {
        units: "kilometers",
      });
      let bbox = [0, 0, 0, 0];
      let polygon = bboxPolygon(bbox);

      const obstacles = buffer(clearances, 0.25, {
        units: "kilometers",
      });
      /* add find user location button */
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        })
      );
      map.current.on("load", function () {
        // Listen for the `result` event from the MapboxGeocoder that is triggered when a user
        // makes a selection and add a symbol that matches the result.
        geocoder.on("result", function (ev) {
          console.log(ev.result.center);
        });
      });
      map.current.on("load", () => {
        map.current.addSource("museums", {
          type: "vector",
          url: "mapbox://mapbox.2opop9hr",
        });
        map.current.addLayer({
          id: "museums",
          type: "circle",
          source: "museums",
          layout: {
            // Make the layer visible by default.
            visibility: "visible",
          },
          paint: {
            "circle-radius": 8,
            "circle-color": "rgba(55,148,179,1)",
          },
          "source-layer": "museum-cusco",
        });

        map.current.addSource("contours", {
          type: "vector",
          url: "mapbox://mapbox.mapbox-terrain-v2",
        });
        map.current.addLayer({
          id: "contours",
          type: "line",
          source: "contours",
          "source-layer": "contour",
          layout: {
            // Make the layer visible by default.
            visibility: "visible",
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#877b59",
            "line-width": 1,
          },
        });
        // Load an image from an external URL.
        // map.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/cat.png',
        map.current.loadImage(
          "https://raw.githubusercontent.com/ffferncake/InteractiveWebMap/main/warning.png",
          (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.current.addImage("warning", image);

            map.current.addLayer({
              id: "mygeojson",
              type: "symbol",
              source: {
                type: "geojson",
                data: mygeojson,
              },
              layout: {
                "icon-image": "warning",
                "icon-allow-overlap": true,
                "icon-size": 0.07,
              },
              paint: {},
            });
          }
        );
        // Source and layer for the bounding box
        map.current.addSource("theBox", {
          type: "geojson",
          data: {
            type: "Feature",
          },
        });
        map.current.addLayer({
          id: "theBox",
          type: "fill",
          source: "theBox",
          layout: {},
          paint: {
            "fill-color": "#FFC300",
            "fill-opacity": 0.5,
            "fill-outline-color": "#FFC300",
          },
        });
        map.current.addLayer({
          id: "clearances",
          type: "fill",
          source: {
            type: "geojson",
            data: obstacles,
          },
          layout: {},
          paint: {
            "fill-color": "#f03b20",
            "fill-opacity": 0.5,
            "fill-outline-color": "#f03b20",
          },
        });
        map.current.addLayer({
          id: "clearances",
          type: "fill",
          source: {
            type: "geojson",
            data: obstacle,
          },
          layout: {},
          paint: {
            "fill-color": "#f03b20",
            "fill-opacity": 0.5,
            "fill-outline-color": "#f03b20",
          },
        });
      });

      for (let i = 0; i < 3; i++) {
        map.current.addSource(`route${i}`, {
          type: "geojson",
          data: {
            type: "Feature",
          },
        });
        map.current.addLayer({
          id: `route${i}`,
          type: "line",
          source: `route${i}`,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#cccccc",
            "line-opacity": 0.5,
            "line-width": 13,
            "line-blur": 0.5,
          },
        });
      }
      // After the last frame rendered before the map enters an "idle" state.
      map.current.on("idle", () => {
        // If these two layers were not added to the map, abort
        if (
          !map.current.getLayer("contours") ||
          !map.current.getLayer("mygeojson")
        ) {
          return;
        }

        // Enumerate ids of the layers.
        const toggleableLayerIds = ["contours", "mygeojson"];

        // Set up the corresponding toggle button for each layer.
        for (const id of toggleableLayerIds) {
          // Skip layers that already have a button set up.
          if (document.getElementById(id)) {
            continue;
          }

          // Create a link.
          const link = document.createElement("a");
          link.id = id;
          link.href = "#";
          link.textContent = id;
          link.className = "active";

          // Show or hide layer when the toggle is clicked.
          link.onclick = function (e) {
            const clickedLayer = this.textContent;
            e.preventDefault();
            e.stopPropagation();

            const visibility = map.current.getLayoutProperty(
              clickedLayer,
              "visibility"
            );

            // Toggle layer visibility by changing the layout object's visibility property.
            if (visibility === "visible") {
              map.current.setLayoutProperty(clickedLayer, "visibility", "none");
              this.className = "";
            } else {
              this.className = "active";
              map.current.setLayoutProperty(
                clickedLayer,
                "visibility",
                "visible"
              );
            }
          };

          const layers = document.getElementById("menu");
          layers.appendChild(link);
        }
      });
      directions.on("route", (event) => {
        const reports = document.getElementById("reports");
        reports.innerHTML = "";
        const report = reports.appendChild(document.createElement("div"));
        // Add IDs to the routes
        const routes = event.route.map((route, index) => ({
          ...route,
          id: index,
        }));

        // Hide all routes by setting the opacity to zero.
        for (let i = 0; i < 3; i++) {
          map.current.setLayoutProperty(`route${i}`, "visibility", "none");
        }

        for (const route of routes) {
          // Make each route visible, by setting the opacity to 50%.
          map.current.setLayoutProperty(
            `route${route.id}`,
            "visibility",
            "visible"
          );

          // Get GeoJSON LineString feature of route
          const routeLine = polyline.toGeoJSON(route.geometry);

          // Update the data for the route, updating the visual.
          map.current.getSource(`route${route.id}`).setData(routeLine);

          const isClear = booleanDisjoint(obstacle, routeLine) === true;

          // const collision = isClear ? "is good!" : "is bad.";
          const collision = isClear ? "ไม่ผ่านอุปสรรค !" : "ควรหลีกเลี่ยง.";
          const emoji = isClear ? "✔️" : "⚠️";
          //const detail = isClear ? "does not go" : "goes";
          const detail = isClear ? "ไม่ผ่าน" : "ผ่าน";
          report.className = isClear ? "item" : "item-warning";

          if (isClear) {
            map.current.setPaintProperty(
              `route${route.id}`,
              "line-color",
              "#74c476"
            );
          } else {
            map.current.setPaintProperty(
              `route${route.id}`,
              "line-color",
              "#de2d26"
            );
          }

          // Add a new report section to the sidebar.
          // Assign a unique id to the report.
          report.id = `report-${route.id}`;

          // Add the response to the individual report created above.
          const heading = report.appendChild(document.createElement("div"));

          // Set the class type based on clear value.
          heading.className = isClear ? "title" : "warning";
          heading.innerHTML = `${emoji} Route ${route.id + 1} ${collision}`;

          // Add details to the individual report.
          const details = report.appendChild(document.createElement("h2"));
          // details.innerHTML = `This route ${detail} through an avoidance area.`;
          details.innerHTML = `เส้นทางนี้ ${detail} จุดอุปสรรค.`;
          report.appendChild(document.createElement("hr"));
        }
      });
    }
  });

  return (
    <div>
      <div className="bottombar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
      {/* <Geocoder
        mapRef={mapContainer}
        onViewportChange={handleGeocoderViewportChange}
        mapboxApiAccessToken={mapboxgl.accessToken}
        position="top-left"
      /> */}
      <div class="sidebar">
        <h1>รายงานเส้นทาง</h1>
        <div id="reports"></div>
      </div>
      <nav id="menu"></nav>
      {/* <div id="geocoder" class="geocoder"></div> */}
      {/* <div class="geocoder">
        <div id="geocoder"></div>
      </div> */}
    </div>
  );
}
