
import type { mapParserInterface, layersInterface, SpriteSheetLoader, TilesetLoader } from "$lib/interface/map-parser"
import defaultLayersParser from "./layer-parser"
import defaultTilesetsParser from "./tilesets-parser"

const defaultTilesetFiles: TilesetLoader = import.meta.glob("/src/lib/assets/tilesets/rusted-warfare/tilesets/*/*.tsx", {as: "raw" } )
const defaultSpriteSheets: SpriteSheetLoader = import.meta.glob("/src/lib/assets/tilesets/rusted-warfare/bitmaps/*.png")


export default class MapParser implements mapParserInterface {
  
  constructor(
    layersParser = defaultLayersParser,
    tilesetsParser = defaultTilesetsParser,
    tilesetFiles: TilesetLoader = defaultTilesetFiles,
    spriteSheets: SpriteSheetLoader = defaultSpriteSheets,
  ) {
    this.parseLayers = layersParser
    this.parseTilesets = tilesetsParser
    this.tilesetFiles = defaultTilesetFiles
    this.spriteSheets = defaultSpriteSheets
  }
  
  async parseMap(tmxString: string): mapInterface {
    const xmlParser = new DOMParser()
    
    const xmlDoc: XMLDocument = xmlParser.parseFromString(tmxString, "application/xml")
    const mapElement: Element = xmlDoc.querySelector("map")
    
    const layersNodeArray: Element[] = xmlDoc.querySelectorAll("layer")
    const tilesetsNodeArray: Element[] = xmlDoc.querySelectorAll("tileset")
    
    const layers: layersInterface = this.parseLayers(layersNodeArray)
    const usedTilesetNodes: Element[] = this.findUsedTilesets(tilesetsNodeArray, layers)
    const tilesetMap: tilesetMapInterface = await this.parseTilesets(usedTilesetNodes, this.tilesetFiles, this.spriteSheets) 
    return {
    width: mapElement.getAttribute("width"),
    heigth: mapElement.getAttribute("heigth"),
    tileWidth: mapElement.getAttribute("tilewidth"),
    tileHeigth: mapElement.getAttribute("tileheight"),
    layers, 
    tilesetMap
  }
  }
  
  private findUsedTilesets(tilesetsNodeArray: Element[], layers: layersInterface ) {
    const firstGids = []
    const usedTilesets = []
    const tilesets = {}
    for(let tileset of tilesetsNodeArray) {
      const firstGid = tileset.getAttribute("firstgid") 
      tilesets[firstGid] = tileset
      firstGids.push(firstGid)
    }
    // sort array
    firstGids.sort((a, b) => Number(a) - Number(b) )
    const layer = layers[0]
    for(let gid of layer.data) {
      for(let i = 0; i < firstGids.length; i++) {
        if(gid < firstGids[i]) {
          const tileset = tilesets[firstGids[i - 1] ]
          if(!usedTilesets.includes(tileset) ) {
            usedTilesets.push(tileset)
          }
          break
        }
        if(i == firstGids.length - 1) {
          const tileset = tilesets[firstGids[i] ]
          if(!usedTilesets.includes(tileset) ) {
            usedTilesets.push(tileset)
          }
        }
      }
    }
    return usedTilesets
  }
}