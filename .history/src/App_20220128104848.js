import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "./hook/axios";
import FeatureService from "mapbox-gl-arcgis-featureserver";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { MapboxLayersControl } from "@adrisolid/mapbox-gl-layers-control";
import "@adrisolid/mapbox-gl-layers-control/styles.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmVybmNha2UiLCJhIjoiY2txajcyaWwwMDh2bjMwbngwM2hnaGdjZSJ9.w6HwEX8hDJzyYKOC7X7WHg";

const App = () => {
  var map = useRef(null);
  const mapContainer = useRef(null);
  // const map = useRef(null);
  const [lng, setLng] = useState(100.4518);
  const [lat, setLat] = useState(13.7563);
  const [zoom, setZoom] = useState(11);
  const reports = document.getElementById("reports");
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
    {
      id: 3,
      title: "Mapbox:Street",
      uri: "mapbox://styles/mapbox/streets-v11",
    },
    {
      id: 4,
      title: "Mapbox:Light",
      uri: "mapbox://styles/mapbox/light-v9",
    },
    {
      id: 5,
      title: "ArcGIS:LightGray:Labels",
      uri: "https://basemaps-api.arcgis.com/arcgis/rest/services/styles/ArcGIS:LightGray:Labels?type=style&token=AAPK80529f6ab29e4fcc9129c0222e880f42CIDK8Tfdt0_hyqiFR8sOejZUYhBipMAaJMm1t5-SOhc-87OKIhRxfNoHatYxewiy",
    },
    {
      id: 6,
      title: "OSM:Streets",
      uri: "https://basemaps-api.arcgis.com/arcgis/rest/services/styles/OSM:Streets?type=style&token=AAPK80529f6ab29e4fcc9129c0222e880f42CIDK8Tfdt0_hyqiFR8sOejZUYhBipMAaJMm1t5-SOhc-87OKIhRxfNoHatYxewiy",
    },
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

    var converter = require("coordinator"), //node-coordinator
      fn = converter("latlong", "mgrs"), //to convert lat/long to MGRS with 4 digits of precision (within 10 meters)
      mgrs = fn(lat, lng, 4);

    const LAYERS_INFO = [
      {
        id: "buildings-1",
        color: "red",
        xtrsnH: ["/", ["get", "height"], 2],
        xtrsB: ["get", "min_height"],
      },
      {
        id: "buildings-2",
        color: "orange",
        xtrsnH: ["get", "height"],
        xtrsB: ["/", ["get", "height"], 2],
      },
      {
        id: "buildings-3",
        color: "lightblue",
        xtrsnH: ["*", ["get", "height"], 1.5],
        xtrsB: ["get", "height"],
      },
    ];
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      limit: 10,
      marker: false,
      // marker: {
      //   color: "red",
      // },
      placeholder: "ค้นหาสถานที่ รหัสไปรษณีย์ จังหวัด", // Placeholder text for the search bar
      localGeocoder: forwardGeocoder,
      zoom: 13,
    });
    map.current.addControl(geocoder, "top-left");

    map.current.on("style.load", function () {
      const fsSourceId = "featureserver-src";

      const service = new FeatureService(fsSourceId, map.current, {
        url: "https://gistdaportal.gistda.or.th/arcgis/rest/services/LayerList4/FeatureServer/17",
      });

      map.current.addLayer({
        id: "fill-lyr",
        source: fsSourceId,
        type: "fill",
        paint: {
          "fill-opacity": 0.2,
          "fill-color": "green",
          "fill-outline-color": "red",
        },
      });
    });
    function layerGenerator(layers) {
      layers.forEach((layer) => {
        map.current.addLayer({
          id: layer.id,
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": layer.color,
            "fill-extrusion-height": layer.xtrsnH,
            "fill-extrusion-base": layer.xtrsB,
            "fill-extrusion-opacity": 0.6,
          },
        });
      });
    }
    map.current.on("load", function () {
      layerGenerator(LAYERS_INFO);

      map.current.addControl(
        new MapboxLayersControl({
          title: "Floors",
          layersDefinition: [
            {
              name: "Select all",
              group: true,
              children: [
                {
                  id: "buildings-1",
                  name: "First floor",
                },
                {
                  id: "buildings-2",
                  name: "Second floor",
                },
                {
                  id: "buildings-3",
                  name: "Third floor",
                },
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
  });
  return (
    <div>
      {/* <div id="geocoder-container"></div> */}
      <div ref={mapContainer} className="map-container" id="map" />
    </div>
  );
};

export default App;
