import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import * as MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import * as turf from "@turf/turf";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import axios from "./hook/axios";
// import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
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
  const [lng, setLng] = useState(100.5018);
  const [lat, setLat] = useState(13.6263);
  const [zoom, setZoom] = useState(11);
  const [posts, setPosts] = useState([]);
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
    /* find user location */
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    });
    /* add direction */
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

    /* add direction box */
    map.current.addControl(directions, "top-right");

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
    map.current.scrollZoom.enable();
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
    // const clearances = {
    //   type: "FeatureCollection",
    //   features: [
    //     {
    //       type: "Feature",
    //       geometry: {
    //         type: "Point",
    //         coordinates: [100.524, 13.807],
    //       },
    //       properties: {
    //         clearance: "13' 2",
    //       },
    //     },
    //     {
    //       type: "Feature",
    //       geometry: {
    //         type: "Point",
    //         coordinates: [100.434, 13.804],
    //       },
    //       properties: {
    //         clearance: "13' 7",
    //       },
    //     },
    //     {
    //       type: "Feature",
    //       geometry: {
    //         type: "Point",
    //         coordinates: [100.438, 13.832],
    //       },
    //       properties: {
    //         clearance: "13' 7",
    //       },
    //     },
    //     {
    //       type: "Feature",
    //       geometry: {
    //         type: "Point",
    //         coordinates: [100.455, 13.736],
    //       },
    //       properties: {
    //         clearance: "12' 0",
    //       },
    //     },
    //     {
    //       type: "Feature",
    //       geometry: {
    //         type: "Point",
    //         coordinates: [100.55946, 13.30213],
    //       },
    //       properties: {
    //         clearance: "13' 6",
    //       },
    //     },
    //     {
    //       type: "Feature",
    //       geometry: {
    //         type: "Point",
    //         coordinates: [100.529, 13.738],
    //       },
    //       properties: {
    //         clearance: "13' 6",
    //       },
    //     },
    //     {
    //       type: "Feature",
    //       geometry: {
    //         type: "Point",
    //         coordinates: [100.548, 13.831],
    //       },
    //       properties: {
    //         clearance: "11' 6",
    //       },
    //     },
    //   ],
    // };

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
                  `<div id = "popup-container"><h3 style="text-align:center"; font-family: "Noto Sans Thai", sans-serif;>${properties.title}</h3> </div>`
                )
                .addTo(map.current);
            });

            map.current.on("mouseleave", "mygeojson", () => {
              map.current.getCanvas().style.cursor = "";
              popup.remove();
            });
          }
        });
      console.log(mygeojson);

      const obstacle = turf.buffer(mygeojson, 0.25, {
        units: "kilometers",
      });

      let bbox = [0, 0, 0, 0];
      let polygon = turf.bboxPolygon(bbox);

      const camera = "https://camera.longdo.com/feed/?command=json";
      getTrafficCamera();

      // //ต้อง allow CORS
      async function getTrafficCamera() {
        let geojsonCamera = { type: "FeatureCollection", features: [] };
        await axios
          .get(camera)
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
              geojsonCamera.features.push(feature);
              // const marker2 = new mapboxgl.Marker()
              //   .setLngLat([point.longitude, point.latitude])
              //   .addTo(map.current);
            }
          });
        console.log(geojsonCamera);

        map.current.on("load", () => {
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

          map.current.loadImage(
            "https://www.pinclipart.com/picdir/big/44-442530_cctv-clipart-traffic-camera-uk-speed-camera-sign.png",
            (error, image) => {
              if (error) throw error;

              //     // Add the image to the map style.
              map.current.addImage("camera", image);

              map.current.addLayer({
                id: "geojsonCamera",
                type: "symbol",
                source: {
                  type: "geojson",
                  data: geojsonCamera,
                },
                layout: {
                  "icon-image": "camera",
                  "icon-allow-overlap": true,
                  "icon-size": 0.04,
                },
                paint: {},
              });
            }
          );

          // map.current.addLayer({
          //   id: "clearances",
          //   type: "fill",
          //   source: {
          //     type: "geojson",
          //     data: obstacle,
          //   },
          //   layout: {},
          //   paint: {
          //     "fill-color": "#f03b20",
          //     "fill-opacity": 0.5,
          //     "fill-outline-color": "#f03b20",
          //   },
          // });

          map.current.addSource("theRoute", {
            type: "geojson",
            data: {
              type: "Feature",
            },
          });

          map.current.addLayer({
            id: "theRoute",
            type: "line",
            source: "theRoute",
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
        });
        map.current.on("load", () => {
          // map.current.addLayer({
          //   id: "clearances",
          //   type: "fill",
          //   source: {
          //     type: "geojson",
          //     data: obstacle,
          //   },
          //   layout: {},
          //   paint: {
          //     "fill-color": "#f03b20",
          //     "fill-opacity": 0.5,
          //     "fill-outline-color": "#f03b20",
          //   },
          // });

          map.current.addSource("theRoute", {
            type: "geojson",
            data: {
              type: "Feature",
            },
          });

          map.current.addLayer({
            id: "theRoute",
            type: "line",
            source: "theRoute",
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
        });
        let counter = 0;
        const maxAttempts = 50;
        let emoji = "";
        let collision = "";
        let detail = "";
        const reports = document.getElementById("reports");

        function addCard(id, element, clear, detail) {
          const card = document.createElement("div");
          card.className = "card";
          // Add the response to the individual report created above
          const heading = document.createElement("div");
          // Set the class type based on clear value
          heading.className =
            clear === true
              ? "card-header route-found"
              : "card-header obstacle-found";
          heading.innerHTML =
            id === 0
              ? // `${emoji} The route ${collision}` :
                `${emoji} เส้นทางนี้ ${collision}`
              : // `${emoji} Route ${id} ${collision}`;
                `${emoji} ถนนหมายเลข ${id} ${collision}`;

          const details = document.createElement("div");
          details.className = "card-details";
          // details.innerHTML = `This ${detail} obstacles.`;
          details.innerHTML = `เส้นทางนี้ ${detail}อุปสรรค.`;

          card.appendChild(heading);
          card.appendChild(details);
          element.insertBefore(card, element.firstChild);
        }
        function noRoutes(element) {
          const card = document.createElement("div");
          card.className = "card";
          // Add the response to the individual report created above
          const heading = document.createElement("div");
          heading.className = "card-header no-route";
          emoji = "🛑";
          heading.innerHTML = `${emoji} Ending search.`;

          // Add details to the individual report
          const details = document.createElement("div");
          details.className = "card-details";
          details.innerHTML = `No clear route found in ${counter} tries.`;

          card.appendChild(heading);
          card.appendChild(details);
          element.insertBefore(card, element.firstChild);
        }

        directions.on("clear", () => {
          map.current.setLayoutProperty("theRoute", "visibility", "none");
          map.current.setLayoutProperty("theBox", "visibility", "none");

          counter = 0;
          reports.innerHTML = "";
        });

        directions.on("route", (event) => {
          // Hide the route and box by setting the opacity to zero
          map.current.setLayoutProperty("theRoute", "visibility", "none");
          map.current.setLayoutProperty("theBox", "visibility", "none");

          if (counter >= maxAttempts) {
            noRoutes(reports);
          } else {
            // Make each route visible
            for (const route of event.route) {
              // Make each route visible
              map.current.setLayoutProperty(
                "theRoute",
                "visibility",
                "visible"
              );
              map.current.setLayoutProperty("theBox", "visibility", "visible");

              // Get GeoJSON LineString feature of route
              const routeLine = polyline.toGeoJSON(route.geometry);

              // Create a bounding box around this route
              // The app will find a random point in the new bbox
              bbox = turf.bbox(routeLine);
              polygon = turf.bboxPolygon(bbox);

              // Update the data for the route
              // This will update the route line on the map
              map.current.getSource("theRoute").setData(routeLine);

              // Update the box
              map.current.getSource("theBox").setData(polygon);

              const clear = turf.booleanDisjoint(obstacle, routeLine);

              if (clear === true) {
                // collision = "does not intersect any obstacles!";
                collision = "ไม่ผ่านจุดอุปสรรค!";
                // detail = `takes ${(route.duration / 60).toFixed(
                detail = `ใช้เวลา ${(route.duration / 60).toFixed(
                  0
                )} นาที และ ไม่ผ่าน`;
                // minutes and avoids
                emoji = "✔️";
                map.current.setPaintProperty(
                  "theRoute",
                  "line-color",
                  "#74c476"
                );
                // Hide the box
                map.current.setLayoutProperty("theBox", "visibility", "none");
                // Reset the counter
                counter = 0;
              } else {
                // Collision occurred, so increment the counter
                counter = counter + 1;
                // As the attempts increase, expand the search area
                // by a factor of the attempt count
                polygon = turf.transformScale(polygon, counter * 0.01);
                bbox = turf.bbox(polygon);
                // collision = "is bad.";
                collision = "ควรหลีกเลี่ยง";
                detail = `ใช้เวลา ${(route.duration / 60).toFixed(
                  0
                )} นาที และ ผ่าน`;
                emoji = "⚠️";
                map.current.setPaintProperty(
                  "theRoute",
                  "line-color",
                  "#de2d26"
                );

                // Add a randomly selected waypoint to get a new route from the Directions API
                const randomWaypoint = turf.randomPoint(1, {
                  bbox: bbox,
                });
                directions.setWaypoint(
                  0,
                  randomWaypoint["features"][0].geometry.coordinates
                );
              }
              // Add a new report section to the sidebar
              addCard(counter, reports, clear, detail);
            }
          }
        });
        // }
      }
      // const camera = "https://camera.longdo.com/feed/?command=json";
      // getTrafficCamera();

      // //ต้อง allow CORS
      // async function getTrafficCamera() {
      //   let geojsonCamera = { type: "FeatureCollection", features: [] };
      //   await fetch(camera)
      //     .then((response) => response.json())
      //     .then((data) => {
      //       for (let point of data) {
      //         let coordinate = [
      //           parseFloat(point.longitude),
      //           parseFloat(point.latitude),
      //         ];
      //         let properties = point;
      //         // delete properties.longitude;
      //         // delete properties.latitude;
      //         let feature = {
      //           type: "Feature",
      //           geometry: { type: "Point", coordinates: coordinate },
      //           properties: properties,
      //         };
      //         geojsonCamera.features.push(feature);

      //         map.current.on("load", () => {
      //           map.current.loadImage(
      //             "http://www.newdesignfile.com/postpic/2009/10/security-camera-icon_236720.png",
      //             (error, image) => {
      //               if (error) throw error;

      //               // Add the image to the map style.
      //               map.current.addImage("camera", image);

      //               map.current.addLayer({
      //                 id: "geojsonCamera",
      //                 type: "symbol",
      //                 source: {
      //                   type: "geojson",
      //                   data: geojsonCamera,
      //                 },
      //                 layout: {
      //                   "icon-image": "camera",
      //                   "icon-allow-overlap": true,
      //                   "icon-size": 0.07,
      //                 },
      //                 paint: {},
      //               });
      //             }
      //           );
      //         });
      //         const marker2 = new mapboxgl.Marker()
      //           .setLngLat([point.longitude, point.latitude])
      //           .addTo(map.current);
      //       }
      //     });
      //   console.log(geojsonCamera);
    } //ของ function camera
  });

  return (
    <div>
      <div className="topbar">
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
      {/* <div class="geocoder">
        <div id="geocoder"></div>
      </div> */}
    </div>
  );
}
