import type { TilesetInterface, TileSetMapInterface } from "$lib/interfaces"



function normalizePath(path: string): string {
    const lastSlash = path.lastIndexOf('/');
    const fileName = lastSlash === -1 ? path : path.slice(lastSlash + 1);
    return `bitmaps/${fileName}`;
}

async function loadImage(tileSet: Element) {
  try {
    const name = tileSet.getAttribute("name")
    const imageNode = tileSet.querySelector("image")
    if(!imageNode) { throw new Error(`tileset: ${name} has no image node`) }
    const imagePath = normalizePath(imageNode!.getAttribute("source")!)
    if(!imagePath) { throw new Error(`tileset: ${name} has no image path`) }
    
    const image = new Image()
    image.src = `../maps/${imagePath}`
    await image.decode()
    return image
  }
  catch (error){
    console.error(error)
  }
}


async function parseTileSet(tileSet: Element): TilesetInterface {
  const image = await loadImage(tileSet)
  const firstGid = Number(tileSet.getAttribute("firstgid"))
  const name = tileSet.getAttribute("name")!;
  const tileWidth = Number(tileSet.getAttribute("tilewidth"));
  const tileHeight = Number(tileSet.getAttribute("tileheight"));
  const spacing = Number(tileSet.getAttribute("spacing") || 0);
  const margin = Number(tileSet.getAttribute("margin") || 0);
  const columns = Number(tileSet.getAttribute("columns") || 0);
  
  const tileSetObject: TilesetInterface =  {
    firstGid,
    name,
    tileWidth,
    tileHeight,
    spacing,
    margin,
    columns,
    image
  }
  
  return tileSetObject
}

async function loadTileSetFile(tileSet: Element){
  const parser = new DOMParser()
  const source = tileSet.getAttribute("source")
  if(!source) { return tileSet }
  if(source == "units.tsx") { return }
  const mod = await import (`../maps/${source}?raw`)
  const loadedXml = mod.default
  const doc = parser.parseFromString(loadedXml, "application/xml")
  const loadedTileset = doc.querySelector("tileset")
  loadedTileset.setAttribute("firstgid", tileSet.getAttribute("firstgid") )
  return loadedTileset
}

export async function getTilesetMap(tileSets: Element[] ): TileSetMapInterface {
  const tileSetMap: TileSetMapInterface = {}
  for(let tileSet of tileSets) {
    const loadedTileset = await loadTileSetFile(tileSet)
    if(!loadedTileset) { continue }
    const parsedTileset = await parseTileSet(loadedTileset)
    tileSetMap[parsedTileset.firstGid] = parsedTileset
  }
  console.log("done")
  return tileSetMap
}

