

import type { mapParserInterface, layersInterface, SpriteSheetLoader, TilesetLoader, TileSetMapInterface } from "$lib/interface/map-parser"


export function getFileName(path: string): string {
  const lastSlash = path.lastIndexOf('/');
  const fileName = lastSlash === -1 ? path : path.slice(lastSlash + 1);
  return fileName
}


export async function loadTileset(tilesetNode: Element, tilesetFiles: TilesetLoader ): Element {
  const xmlParser = new DOMParser()
  const source = tilesetNode.getAttribute("source")
  if(!source ) { return tilesetNode }
  if(source == "units.tsx") { return }
  
  const path = `/src/lib/assets/tilesets/rusted-warfare/tilesets/${source}`
  const loader = tilesetFiles[path]
  if(!loader) { 
    console.log(path)
  }
  const xmlString: string = await loader()
  const doc = xmlParser.parseFromString(xmlString, "application/xml")
  const loadedTileset = doc.querySelector("tileset")
  loadedTileset.setAttribute("firstgid", tilesetNode.getAttribute("firstgid") )
  return loadedTileset
}

export async function loadImage(loadedTileset: Element, spriteSheets: SpriteSheetLoader) {
  const imageNode = loadedTileset.querySelector("image")
  const name = loadedTileset.getAttribute("name")
  if(!imageNode) { throw new Error(`tileset: ${name} has no image node`) }
  
  const source = imageNode.getAttribute("source")
  const spritePath = `/src/lib/assets/tilesets/rusted-warfare/bitmaps/${getFileName(source) }`
  
  const loader = spriteSheets[spritePath]
  if(!loader) { 
    throw new Error(`failed to load: ${spritePath} tileset: ${name}`)
  }
  const mod = await loader()
  const imgUrl = mod.default
  
  const sprite = new Image()
  
  return new Promise( (resolve, reject) => {
    sprite.onload = () => resolve(sprite)
    sprite.onerror = reject
    sprite.src = imgUrl
  })
}


export function getFrameSlices(totalCols: number, totalRows: number, tileHeight: number, tileWidth: number ) {
  const frames = {}
  for(let row = 0; row < totalRows; row++) {
    for(let col = 0; col < totalCols; col++) {
      const id =  (row * totalCols ) + col
      const frame = {
        id,
        xStart: ( col * tileWidth ),
        xEnd: ( col * tileWidth ) + tileWidth,
        yStart: ( row * tileHeight ),
        yEnd: ( row * tileHeight ) + tileHeight
      }
      frames[id] = frame
    }
  }
  
  return frames
}

export async function parseLoadedTileset(loadedTileset: Element, spriteSheets: SpriteSheetLoader ): tilesetInterface {
  
  const image = await loadImage(loadedTileset, spriteSheets)
  const firstGid = Number(loadedTileset.getAttribute("firstgid"))
  const name = loadedTileset.getAttribute("name")!;
  const tileWidth = Number(loadedTileset.getAttribute("tilewidth"));
  const tileHeight = Number(loadedTileset.getAttribute("tileheight"));
  const spacing = Number(loadedTileset.getAttribute("spacing") || 0);
  const margin = Number(loadedTileset.getAttribute("margin") || 0);
  
  const rows = image.naturalHeight / tileHeight
  const cols = image.naturalWidth / tileWidth
  
  const frames = getFrameSlices(cols, rows, tileHeight, tileWidth)
  
  const tileSetObject: TilesetInterface =  {
    firstGid,
    name,
    tileWidth,
    tileHeight,
    spacing,
    margin,
    cols,
    rows,
    frames,
    image
  }
  
  return tileSetObject
}

export default async function parseTilesets(tilesetsNodeArray: Element, tilesetFiles: TilesetLoader, spriteSheets: SpriteSheetLoader ): tilesetMapInterface {
  const tileSetMap: TileSetMapInterface = {}
  for(let tilesetNode of tilesetsNodeArray) {
    try {
      const loadedTileset = await loadTileset(tilesetNode, tilesetFiles)
      if(!loadedTileset) { continue }
      const parsedTileset = await parseLoadedTileset(loadedTileset, spriteSheets)
      tileSetMap[parsedTileset.firstGid] = parsedTileset
    } 
    catch(error) {
      console.error(error)
    }
  }
  console.log("done")
  return tileSetMap
}