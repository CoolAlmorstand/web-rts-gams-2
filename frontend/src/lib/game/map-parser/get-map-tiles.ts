
import pako from "pako"

function parseLayer(layer: Element) {
  const data = layer.querySelector("data")!
  const binaryString = atob(data.textContent!.trim() )
  const byteArray = new Uint8Array(binaryString.length)
  for(let i = 0; i < binaryString.length; i++){
    byteArray[i] = binaryString.charCodeAt(i)
  }
  let decompressedData: Uint8Array = pako.inflate(byteArray)
  
  const tileCount = decompressedData.length / 4
  const tiles: number[] = [];
  const view = new DataView(decompressedData.buffer)
  for(let i = 0; i < tileCount; i++){
    tiles.push(view.getUint32(i * 4, true))
  }
  return tiles
}

export function getMapTiles(layers: Element[]) {
  for(let layer of layers){
    if(layer.getAttribute("name") == "Ground") {
      return parseLayer(layer)
    }
  }
}