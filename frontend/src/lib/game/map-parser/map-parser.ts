import { getMapTiles } from "./get-map-tiles.ts"
import { getTilesetMap } from "./get-tileset-map.ts"

export default async function parseMap(tmxText: string) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(tmxText, "application/xml" )
  const mapEl = xmlDoc.querySelector("map")
  const layers = xmlDoc.querySelectorAll("layer")
  const mapTiles = getMapTiles(layers)
  
  const tilesets = xmlDoc.querySelectorAll("tileset")
  const tilesetMap = await getTilesetMap(tilesets)
  return {
    width: mapEl.getAttribute("width"),
    heigth: mapEl.getAttribute("heigth"),
    tileWidth: mapEl.getAttribute("tilewidth"),
    tileHeigth: mapEl.getAttribute("tileheight"),
    mapTiles, 
    tilesetMap 
    
  }
}


