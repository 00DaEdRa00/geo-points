import { useEffect, useRef } from "react";
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat, toLonLat } from "ol/proj";
import { Style, Circle as CircleStyle, Fill, Stroke } from "ol/style"
import type OlPoint from "ol/geom/Point";
import { Point } from "../hooks/usePoints";
import { unByKey } from "ol/Observable";


interface MapComponentProps {
    selectedPoint: Point | null;
    onPointClick: (point: Point) => void;
}

const blueStyle = new Style({
    image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: "#3388cc" }),
        stroke: new Stroke({ color: "#fff", width: 2 }),
    }),
});

const redStyle = new Style({
    image: new CircleStyle({
        radius: 10,
        fill: new Fill({ color: "#e53935" }),
        stroke: new Stroke({ color: "#fff", width: 3 }),
    }),
});

export function MapComponent({ selectedPoint, onPointClick }: MapComponentProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapOlRef = useRef<Map | null>(null);
    const sourceRef = useRef<VectorSource | null>(null);
    const selectedIdRef = useRef<number | null>(null);
    const onPointClickRef = useRef(onPointClick);
    onPointClickRef.current = onPointClick;
    selectedIdRef.current = selectedPoint?.id ?? null;

    useEffect(() => {
        const map = new Map({
            target: mapRef.current!,
            layers: [new TileLayer({ source: new OSM() })],
            view: new View({ center: fromLonLat([37.62, 55.75]), zoom: 10 }),
        });
        mapOlRef.current = map;

        const controller = new AbortController();
        fetch("/api/geojson/", { signal: controller.signal })
            .then(r => {
                if (!r.ok) throw new Error("failed");
                return r.json();
            })
            .then(geojson => {
                const source = new VectorSource({
                    features: new GeoJSON().readFeatures(geojson, {
                        dataProjection: "EPSG:4326",
                        featureProjection: "EPSG:3857",
                    }),
                });
                sourceRef.current = source;
                map.addLayer(new VectorLayer({
                    source,
                    style: (feature) =>
                        feature.get("id") === selectedIdRef.current ? redStyle : blueStyle,
                }));
            })
            .catch(e => {
                if (e instanceof DOMException && e.name === "AbortError") return;
                console.error("Не удалось загрузить точки", e);
            });

        const clickHandler = map.on("singleclick", (evt) => {
            const feature = map.forEachFeatureAtPixel(evt.pixel, f => f);
            if (!feature) return;
            const props = feature.getProperties();
            const geometry = feature.getGeometry();
            let lon = props.lon;
            let lat = props.lat;
            if ((lon == null || lat == null) && geometry?.getType() === "Point") {
                [lon, lat] = toLonLat((geometry as OlPoint).getCoordinates());
            }
            const { geometry: _geometry, ...rest } = props;
            onPointClickRef.current({ ...rest, lon, lat } as Point);
        });

        return () => {
            controller.abort();
            unByKey(clickHandler);
            map.setTarget(undefined);
            mapOlRef.current = null;
            sourceRef.current = null;
        };
    }, []);

    useEffect(() => {
        sourceRef.current?.changed();

        if (!selectedPoint || selectedPoint.lon == null || selectedPoint.lat == null) return;
        const map = mapOlRef.current;
        if (!map) return;

        map.getView().animate({
            center: fromLonLat([selectedPoint.lon, selectedPoint.lat]),
            zoom: 14,
            duration: 400,
        });
    }, [selectedPoint]);

    return <div ref={mapRef} className="map" />;
}
