import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useGeographic } from "ol/proj";
import { Fill, Stroke, Style, Text } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Map, MapBrowserEvent, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { FeatureLike } from "ol/Feature";
import { SchoolLayerCheckbox } from "./modules/layers/schoolLayerCheckbox";
import { Layer } from "ol/layer";

import "ol/ol.css";
import "./application.css";

useGeographic();

const focusedStyle = (feature: FeatureLike) =>
  new Style({
    stroke: new Stroke({
      width: 2,
    }),
    text: new Text({
      text: feature.getProperties().name,
      fill: new Fill({ color: "white" }),
      stroke: new Stroke({ color: "black", width: 7 }),
    }),
  });

let municipalityLayer = new VectorLayer({
  source: new VectorSource({
    url: "/Forelesning-03/geojson/kommuner.geojson",
    format: new GeoJSON(),
  }),
  style: new Style({
    stroke: new Stroke({
      color: "red",
      width: 2,
    }),
  }),
});

let countyLayer = new VectorLayer({
  source: new VectorSource({
    url: "/Forelesning-03/geojson/fylker.geojson",
    format: new GeoJSON(),
  }),
  style: new Style({
    stroke: new Stroke({
      color: "blue",
      width: 4,
    }),
  }),
});

/*const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    municipalityLayer,
    //countyLayer,
    new VectorLayer({
      source: new VectorSource({
        url: "/Forelesning-03/geojson/vgs.geojson",
        format: new GeoJSON(),
      }),
    }),
  ],
  view: new View({ center: [10.7, 59.9], zoom: 11 }),
});*/

const view = new View({ center: [10.7, 59.9], zoom: 11 });
const map = new Map({ view });

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [layers, setLayers] = useState<Layer[]>([
    new TileLayer({ source: new OSM() }),
    municipalityLayer,
    countyLayer,
  ]);
  const activeFeatures = useRef<Feature<Geometry>[]>([]);

  function handlePointerMove(event: MapBrowserEvent<MouseEvent>) {
    for (const feature of activeFeatures.current) {
      feature.setStyle(undefined);
    }
    const focusedFeatures =
      municipalityLayer
        .getSource()
        ?.getFeaturesAtCoordinate(event.coordinate) || [];
    for (const feature of focusedFeatures) {
      feature.setStyle(focusedStyle(feature));
    }
    activeFeatures.current = focusedFeatures || [];
  }

  useEffect(() => {
    map.setTarget(mapRef.current!);
    map.setLayers(layers);
    map.on("pointermove", handlePointerMove);
  }, [layers]);

  function handleClick() {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        view.animate({
          center: [longitude, latitude],
          zoom: 12,
          duration: 500,
        });
      },
    );
  }

  return (
    <>
      <nav>
        <button onClick={handleClick}>Center on me</button>
        <SchoolLayerCheckbox setLayers={setLayers} map={map} />
      </nav>
      <main>
        <div ref={mapRef}></div>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Application />);
