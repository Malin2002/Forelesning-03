import React from "react";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import VectorLayer from "ol/layer/Vector";
import { Map, MapBrowserEvent, Overlay } from "ol";
import { Layer } from "ol/layer";
import { useEffect, useRef, useState } from "react";
import { FeatureLike } from "ol/Feature";

const source = new VectorSource({
  url: "/Forelesning-03/geojson/barne-og-ungdomsskoler.geojson",
  format: new GeoJSON(),
});

const schoolLayer = new VectorLayer({
  source,
});
const overlay = new Overlay({
  positioning: "bottom-center",
});

export function SchoolLayerCheckbox({
  setLayers,
  map,
}: {
  setLayers: (value: (prevState: Layer[]) => Layer[]) => void;
  map: Map;
}) {
  const [checked, setChecked] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null!);
  const [selectedSchools, setSelectedSchools] = useState<FeatureLike[]>([]);

  function handleClick(e: MapBrowserEvent<MouseEvent>) {
    setSelectedSchools(map.getFeaturesAtPixel(e.pixel));
    overlay.setPosition(e.coordinate);
  }

  useEffect(() => {
    if (overlayRef.current) {
      overlay.setElement(overlayRef.current);
    }
    if (checked) {
      setLayers((old) => [...old, schoolLayer]);
      map.on("click", handleClick);
    } else {
      setLayers((old) => old.filter((l) => l !== schoolLayer));
    }
  }, [checked]);

  return (
    <button onClick={() => setChecked((b) => !b)}>
      <input type={"checkbox"} checked={checked} />
      Show schools on map
      <div ref={overlayRef}>
        Clicked schools:{" "}
        {selectedSchools.map((s) => s.getProperties().navn).join(", ")}
      </div>
    </button>
  );
}
