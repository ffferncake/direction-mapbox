import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import { bboxPolygon, buffer, booleanDisjoint } from "@turf/turf";
import "./style/direction-style.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
import "mapbox-gl-style-switcher/styles.css";
import { RulerControl, CompassControl, ZoomControl } from "mapbox-gl-controls";
import FeatureService from "mapbox-gl-arcgis-featureserver";
import { MapboxLayersControl } from "@adrisolid/mapbox-gl-layers-control";
import "@adrisolid/mapbox-gl-layers-control/styles.css";
import axios from "./hook/axios";

var polyline = require("@mapbox/polyline");

// var bbox = require("@turf/turf");
// var ajax = require("react-ajax");

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmVybmNha2UiLCJhIjoiY2txajcyaWwwMDh2bjMwbngwM2hnaGdjZSJ9.w6HwEX8hDJzyYKOC7X7WHg";

export default function App() {
  var map = useRef(null);
  const mapContainer = useRef(null);
  // const map = useRef(null);
  const [lng, setLng] = useState(100.4518);
  const [lat, setLat] = useState(13.7563);
  const [zoom, setZoom] = useState(11);
  const reports = document.getElementById("reports");

  var converter = require("coordinator"), //node-coordinator
    fn = converter("latlong", "mgrs"), //to convert lat/long to MGRS with 4 digits of precision (within 10 meters)
    mgrs = fn(lat, lng, 4);

  //Base map style
  const styles = [
    {
      id: 0,
      title: "Mapbox:Navigation-day",
      uri: "mapbox://styles/mapbox/navigation-preview-day-v4",
    },
    {
      id: 1,
      title: "Mapbox:Navigation-night",
      uri: "mapbox://styles/mapbox/navigation-preview-night-v4",
    },
    {
      id: 2,
      title: "Mapbox:Satellite",
      uri: "mapbox://styles/mapbox/satellite-v9",
    },
    // {
    //   id: 3,
    //   title: "Mapbox:Street",
    //   uri: "mapbox://styles/mapbox/streets-v11",
    // },
    // {
    //   id: 4,
    //   title: "Mapbox:Light",
    //   uri: "mapbox://styles/mapbox/light-v9",
    // },
    // {
    //   id: 5,
    //   title: "ArcGIS:LightGray:Labels",
    //   uri: "https://basemaps-api.arcgis.com/arcgis/rest/services/styles/ArcGIS:LightGray:Labels?type=style&token=AAPK80529f6ab29e4fcc9129c0222e880f42CIDK8Tfdt0_hyqiFR8sOejZUYhBipMAaJMm1t5-SOhc-87OKIhRxfNoHatYxewiy",
    // },
    // {
    //   id: 6,
    //   title: "OSM:Streets",
    //   uri: "https://basemaps-api.arcgis.com/arcgis/rest/services/styles/OSM:Streets?type=style&token=AAPK80529f6ab29e4fcc9129c0222e880f42CIDK8Tfdt0_hyqiFR8sOejZUYhBipMAaJMm1t5-SOhc-87OKIhRxfNoHatYxewiy",
    // },
    {
      id: 7,
      title: "OSM:StandardRelief",
      uri: "https://basemaps-api.arcgis.com/arcgis/rest/services/styles/OSM:StandardRelief?type=style&token=AAPK80529f6ab29e4fcc9129c0222e880f42CIDK8Tfdt0_hyqiFR8sOejZUYhBipMAaJMm1t5-SOhc-87OKIhRxfNoHatYxewiy",
    },
    {
      id: 8,
      title: "ArcGIS:Topographic:Base",
      uri: "https://basemaps-api.arcgis.com/arcgis/rest/services/styles/ArcGIS:Topographic:Base?type=style&token=AAPK80529f6ab29e4fcc9129c0222e880f42CIDK8Tfdt0_hyqiFR8sOejZUYhBipMAaJMm1t5-SOhc-87OKIhRxfNoHatYxewiy",
    },
  ];

  const [activeUrl, setActiveUrl] = useState(styles[0].uri);
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: activeUrl,
      center: [lng, lat],
      zoom: zoom,
      flyTo: true,
    });

    /************************************ mapbox switcher ******************************/
    map.current.addControl(new MapboxStyleSwitcherControl(styles, "Dark"));

    /************************ Add the geocoder to the map ******************************/
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      // marker: {
      //   color: "red",
      // },
      limit: 10,
      placeholder: "ค้นหาสถานที่ รหัสไปรษณีย์ จังหวัด", // Placeholder text for the search bar
      localGeocoder: forwardGeocoder,
      zoom: 11,
    });

    map.current.addControl(geocoder, "top-right");

    /********************************* direction ***************************/
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric",
      profile: "mapbox/driving",
      alternatives: true,
      geometries: "geojson",
      controls: { instructions: true },
      flyTo: true,
    });
    map.current.scrollZoom.enable();

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    /************************ Add Control from mapbox-gl-controls ******************************/
    map.current.addControl(new ZoomControl(), "bottom-right");
    map.current.addControl(new CompassControl(), "bottom-right");
    map.current.on("ruler.on", () => console.log("ruler: on"));
    map.current.on("ruler.off", () => console.log("ruler: off"));
    // with miles:
    map.current.addControl(
      new RulerControl({
        units: "miles",
        labelFormat: (n) => `${n.toFixed(2)} miles`,
      }),
      "bottom-right"
    );

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

    map.current.on("load", function () {
      //overlay controler
      map.current.addControl(
        new MapboxLayersControl({
          title: "ชั้นข้อมูล",
          layersDefinition: [
            {
              name: "เลือกข้อมูลที่ตั้งทั้งหมด",
              group: true,
              children: [
                {
                  id: "trafficIncident",
                  name: "อุบัติเหตุ ปิดเบี่ยงจราจร",
                },
                {
                  id: "hospital-layer",
                  name: "โรงพยาบาล",
                },
                {
                  id: "school-circle",
                  name: "โรงเรียน",
                },
              ],
            },
            {
              name: "เลือกข้อมูลประเทศไทย",
              group: true,
              children: [
                {
                  id: "tambon-lyr",
                  name: "ขอบเขตตำบล",
                },
                // {
                //   id: "amp-layer",
                //   name: "อำเภอ",
                // },
                // {
                //   id: "school-circle",
                //   name: "ตำบล",
                // },
              ],
            },
          ],
        })
      );
    });

    var customDatas = [];

    async function AxiosTest() {
      await axios.get("/tambon_coords").then(function (response) {
        const jo = JSON.parse(JSON.stringify(response));
        const jo_data = jo.data;
        console.log("response.data :::", jo_data);

        for (let point of jo_data) {
          // console.log(1);
          // geocoder.addTo("#geocoder-container");
          customDatas.push({
            features: [
              {
                type: "Feature",
                properties: {
                  title: point.tb_tn,
                  amp: point.ap_tn,
                  prov: point.pv_tn,
                },
                geometry: {
                  coordinates: [parseFloat(point.long), parseFloat(point.lat)],
                  type: "Point",
                },
              },
            ],
            type: "FeatureCollection",
          });
          // console.log("customData :::", customData);
          // customData.push(c)
        }
      });
    }

    AxiosTest();
    function forwardGeocoder(query) {
      const matchingFeatures = [];
      for (let customData of customDatas) {
        // console.log(customData);
        for (const feature of customData.features) {
          // Handle queries with different capitalization
          // than the source data by calling toLowerCase().
          const Merge =
            feature.properties.title +
            " " +
            feature.properties.amp +
            " " +
            feature.properties.prov;
          if (
            Merge.includes(query.toLowerCase())
            // feature.properties.title
            //   .toLowerCase()
            //   .includes(query.toLowerCase()) ||
            // feature.properties.amp
            //   .toLowerCase()
            //   .includes(query.toLowerCase()) ||
            // feature.properties.prov.toLowerCase().includes(query.toLowerCase())
          ) {
            feature[
              "place_name"
            ] = `🌲 ${feature.properties.title} ${feature.properties.amp} ${feature.properties.prov} `;
            feature["center"] = feature.geometry.coordinates;
            feature["place_type"] = ["tambon"];
            matchingFeatures.push(feature);
          }
        }
      }
      console.log(matchingFeatures);
      return matchingFeatures;
    }

    // getSchool();

    // async function getSchool() {
    //   let schoolGeojson = { type: "FeatureCollection", features: [] };
    //   await axios.get("https://gistdaportal.gistda.or.th/arcgis/rest/services/LayerList4/FeatureServer/10/query?where=1%3D1&f=geojson").then(function (response) {
    //     const school = JSON.stringify(response.data)
    //     console.log("response.school :::", school);
    //       for (let point of school) {
    //         let coordinate = [
    //           parseFloat(point.longitude),
    //           parseFloat(point.latitude),
    //         ];
    //         let properties = point;
    //         let feature = {
    //           type: "Feature",
    //           geometry: { type: "Point", coordinates: coordinate },
    //           properties: properties,
    //         };
    //         schoolGeojson.features.push(feature);

    //         const popup = new mapboxgl.Popup({
    //           closeButton: false,
    //           closeOnClick: false,
    //           offset: 25,
    //         });

    //         map.current.on("mouseenter", "schoolGeojson", (e) => {
    //           map.current.getCanvas().style.cursor = "pointer";
    //           const coordinates = e.features[0].geometry.coordinates;
    //           const title = e.features[0].properties.name_t;

    //           while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    //             coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    //           }
    //           popup
    //             .setLngLat(coordinates)
    //             .setHTML(
    //               `<div id = "popup-container"><h2>${title}</h2></div>`
    //             )
    //             .addTo(map.current);
    //         });
    //         map.current.on("mouseleave", "schoolGeojson", () => {
    //           map.current.getCanvas().style.cursor = "";
    //           popup.remove();
    //         });
    //       }
    //     });
    // }

    const incident = "https://event.longdo.com/feed/json";
    getData();
    // fetchData();
    async function getData() {
      let trafficIncident = { type: "FeatureCollection", features: [] };
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
            trafficIncident.features.push(feature);
            // const marker2 = new mapboxgl.Marker()
            //   .setLngLat([point.longitude, point.latitude])
            //   .addTo(map.current);

            // Create a popup, but don't add it to the map yet.
            const popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 25,
            });

            map.current.on("mouseenter", "trafficIncident", (e) => {
              // Change the cursor style as a UI indicator.
              map.current.getCanvas().style.cursor = "pointer";

              // Copy coordinates array.
              // const coordinates = [point.longitude, point.latitude];
              const coordinates = e.features[0].geometry.coordinates;
              const description = e.features[0].properties.description;
              const title = e.features[0].properties.title;

              // Ensure that if the map is zoomed out such that multiple
              // copies of the feature are visible, the popup appears
              // over the copy being pointed to.
              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }

              popup
                .setLngLat(coordinates)
                .setHTML(
                  `<div id = "popup-container"><h2>${title}</h2><h>${description}</h></div>`
                )
                .addTo(map.current);
            });
            map.current.on("mouseleave", "trafficIncident", () => {
              map.current.getCanvas().style.cursor = "";
              popup.remove();
            });

            // map.current.on("mouseenter", "schoolGeojson", (e) => {
            //   // Change the cursor style as a UI indicator.
            //   map.current.getCanvas().style.cursor = "pointer";

            //   // Copy coordinates array.
            //   // const coordinates = [point.longitude, point.latitude];
            //   const coordinates = e.features[0].geometry.coordinates;
            //   const description = e.features[0].properties.description;
            //   const title = e.features[0].properties.title;

            //   // Ensure that if the map is zoomed out such that multiple
            //   // copies of the feature are visible, the popup appears
            //   // over the copy being pointed to.
            //   while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            //   }

            //   popup
            //     .setLngLat(coordinates)
            //     .setHTML(
            //       `<div id = "popup-container"><h2>${title}</h2><h>${description}</h></div>`
            //     )
            //     .addTo(map.current);
            // });
            // map.current.on("mouseleave", "trafficIncident", () => {
            //   map.current.getCanvas().style.cursor = "";
            //   popup.remove();
            // });
            // const marker2 = new mapboxgl.Marker()
            //   .setLngLat([point.longitude, point.latitude])
            //   .addTo(map.current);
          }
        });
      console.log(trafficIncident);
      // After the last frame rendered before the map enters an "idle" state.

      const obstacle = buffer(trafficIncident, 0.25, {
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
        }),
        "bottom-right"
      );
      /************* direction control box ****************************/
      map.current.addControl(
        new MapboxDirections({
          accessToken: mapboxgl.accessToken,
          unit: "metric",
          profile: "mapbox/driving",
          alternatives: true,
          geometries: "geojson",
          controls: { instructions: true },
          flyTo: true,
        })
      );

      map.current.on("load", function () {
        // Listen for the `result` event from the MapboxGeocoder that is triggered when a user
        // makes a selection and add a symbol that matches the result.
        geocoder.on("result", function (ev) {
          console.log(ev.result.center);
        });
      });

      map.current.on("click", (event) => {
        const coords = Object.keys(event.lngLat).map(
          (key) => event.lngLat[key]
        );
        const end = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: coords,
              },
            },
          ],
        };
        if (map.current.getLayer("end")) {
          map.current.getSource("end").setData(end);
        } else {
          map.current.addLayer({
            id: "end",
            type: "circle",
            source: {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    properties: {},
                    geometry: {
                      type: "Point",
                      coordinates: coords,
                    },
                  },
                ],
              },
            },
            paint: {
              "circle-radius": 10,
              "circle-color": "#f30",
            },
          });
        }
      });

      // After the last frame rendered before the map enters an "idle" state.
      map.current.on("idle", () => {
        const fsSourceId = "featureserver-src";

        const service = new FeatureService(fsSourceId, map.current, {
          url: "https://gistdaportal.gistda.or.th/arcgis/rest/services/LayerList4/FeatureServer/17",
        });

        map.current.addLayer({
          id: "tambon-lyr",
          source: fsSourceId,
          type: "fill",
          paint: {
            // "fill-opacity": 0.2,
            "fill-color": "transparent",
            "fill-outline-color": "red",
          },
          layout: {
            // Make the layer visible by default.
            // visibility: "none",
            visibility: "visible",
          },
        });
        // map.current.addSource("contours", {
        //   type: "vector",
        //   url: "mapbox://mapbox.mapbox-terrain-v2",
        // });
        // map.current.addLayer({
        //   id: "contours",
        //   type: "line",
        //   source: "contours",
        //   "source-layer": "contour",
        //   layout: {
        //     // Make the layer visible by default.
        //     // visibility: "visible",
        //     visibility: "none",
        //     "line-join": "round",
        //     "line-cap": "round",
        //   },
        //   paint: {
        //     "line-color": "#877b59",
        //     "line-width": 1,
        //   },
        // });

        map.current.loadImage(
          "https://raw.githubusercontent.com/ffferncake/InteractiveWebMap/main/hospital-pngrepo-com.png",
          (error, image) => {
            if (error) throw error;

            map.current.addImage("hospital", image);

            map.current.addSource("hospital", {
              type: "geojson",
              // Use a URL for the value for the `data` property.
              // data: "https://data.opendevelopmentmekong.net/dataset/ab20b509-2b7f-442e-8448-05d3a17651ac/resource/76253a1a-b472-4d64-b209-0ea3114f51f4/download/thailand_health_facilities_th.geojson",
              data: "https://geoportal.rtsd.mi.th/arcgis/rest/services/OpenData/TH_CitizenInfo_Health_20200314/FeatureServer/0/query?where=1%3D1&f=geojson",
            });
            map.current.addLayer({
              id: "hospital-layer",
              type: "symbol",
              source: "hospital",
              layout: {
                "icon-image": "hospital",
                "icon-allow-overlap": true,
                "icon-size": 0.07,
                visibility: "visible",
              },
            });
          }
        );

        //ปภ.
        map.current.loadImage(
          "https://raw.githubusercontent.com/ffferncake/InteractiveWebMap/main/ddpm.png",
          (error, image) => {
            if (error) throw error;

            map.current.addImage("ddpm", image);

            map.current.addSource("ddpm", {
              type: "geojson",
              // Use a URL for the value for the `data` property.
              // data: "https://data.opendevelopmentmekong.net/dataset/ab20b509-2b7f-442e-8448-05d3a17651ac/resource/76253a1a-b472-4d64-b209-0ea3114f51f4/download/thailand_health_facilities_th.geojson",
              data: "https://geoportal.rtsd.mi.th/arcgis/rest/services/Hosted/DDPM_UnitAndResposedArea/FeatureServer/0/query?where=1%3D1&f=geojson",
            });
            map.current.addLayer({
              id: "ddpm-layer",
              type: "symbol",
              source: "ddpm",
              layout: {
                "icon-image": "ddpm",
                "icon-allow-overlap": true,
                "icon-size": 0.07,
                visibility: "visible",
              },
            });
          }
        );
        
        // map.current.loadImage(
        //   "https://raw.githubusercontent.com/ffferncake/InteractiveWebMap/main/school.png",
        //   (error, image) => {
        //     if (error) throw error;

        //     map.current.addImage("school", image);
        //     map.current.addSource("school", {
        //       type: "geojson",
        //       data: "schoolGeojson",
        //     });
        //     map.current.addLayer({
        //       id: "school-circle",
        //       type: "symbol",
        //       source: "school",
        //       paint: {
        //         // "circle-color": "red",
        //         // "circle-stroke-width": 1.5,
        //         // "circle-stroke-color": "white",
        //         // "circle-radius": ["case", ["get", "cluster"], 10, 5], // 10 pixels for clusters, 5 pixels otherwise
        //       },
        //       layout: {
        //         "icon-image": "school",
        //         "icon-allow-overlap": true,
        //         "icon-size": 0.04,
        //         visibility: "visible",
        //       },
        //     });
        //   }
        // );
        // Load an image from an external URL.
        map.current.loadImage(
          "https://raw.githubusercontent.com/ffferncake/InteractiveWebMap/main/warning.png",
          (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.current.addImage("warning", image);

            map.current.addLayer({
              id: "trafficIncident",
              type: "symbol",
              source: {
                type: "geojson",
                data: trafficIncident,
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
      });
    }
  });

  // const fetchData = async () => {
  //   let data = await fetch(
  //     "https://data.opendevelopmentmekong.net/dataset/ab20b509-2b7f-442e-8448-05d3a17651ac/resource/76253a1a-b472-4d64-b209-0ea3114f51f4/download/thailand_health_facilities_th.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((geojson) => {
  //       console.log("my_data: ", geojson);
  //       return geojson;
  //     });
  //   // this.setState({ geojson: data });
  //   return data;
  // };
  return (
    <div>
      {/* <!-- lat lng ----> */}
      <div className="bottombar">พิกัดทางทหาร (MGRS) : {mgrs}</div>
      {/* <!-- mgrs ----> */}
      <div className="bottombar_mgrs">
        lat: {lat} | lng: {lng} | zoom: {zoom}
      </div>
      {/* <nav id="menu"></nav> */}
      <div ref={mapContainer} className="map-container" id="map"></div>
      {/* <div class="mapboxgl-ctrl mapboxgl-ctrl-group"> */}
      {/* </div> */}
      {/* <!-- route report ----> */}
      <div class="sidebar">
        <h1>รายงานเส้นทาง</h1>
        <div id="reports"></div>
      </div>
    </div>
  );
}
