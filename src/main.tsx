import React, { useEffect, useRef } from "react";
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

const map = new Map({
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
});

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
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
      feature.setStyle(focusedStyle);
    }
    activeFeatures.current = focusedFeatures || [];
  }

  useEffect(() => {
    map.setTarget(mapRef.current as HTMLDivElement);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        map.getView().animate({
          center: [longitude, latitude],
          zoom: 12,
        });
      },
      (error) => {
        alert(error.message);
      },
    );

    map.on("pointermove", handlePointerMove);
  }, []);

  return <div ref={mapRef}></div>;
}

createRoot(document.getElementById("root")!).render(<Application />);
