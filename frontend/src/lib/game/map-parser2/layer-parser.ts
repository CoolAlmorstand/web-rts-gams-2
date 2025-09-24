
import pako from "pako"

function parseLayerData(layerNode: Element): number[] {
  const dataElement = layerNode.querySelector('data');
  const encoding = dataElement.getAttribute('encoding');
  const compression = dataElement.getAttribute('compression');
  const content = dataElement.textContent?.trim() || '';
  
  let decodedData: Uint8Array | string = content;

  if (encoding === 'base64') {
    const binaryString = atob(content);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    decodedData = bytes;
  }
  
  if (compression === 'zlib' || compression === 'gzip') {
    if (typeof decodedData === 'string') {
      throw new Error('Cannot decompress string data, expected binary data');
    }
    try {
      const decompressed = pako.inflate(decodedData);
      decodedData = decompressed;
    } 
    catch (error) {
      throw new Error(`Failed to decompress data: ${error}`);
    }
  }
  
  else if (compression === 'zstd') {
    throw new Error('we dont support zstd just yet');
  }
  
  if (typeof decodedData === 'string') {
    return decodedData.split(',').map(gid => {
      const parsed = parseInt(gid.trim(), 10);
      return isNaN(parsed) ? 0 : parsed;
    });
  } 
  else {
    // Binary format - interpret as 32-bit little-endian integers
    const gids: number[] = [];
    const dataView = new DataView(decodedData.buffer);
    
    for (let i = 0; i < decodedData.length; i += 4) {
      if (i + 3 < decodedData.length) {
        const gid = dataView.getUint32(i, true); // little-endian
        gids.push(gid);
      }
    }
    
    return gids;
  }
}


export default function parseLayers(layersNodeArray: Element): layersInterface {
  const layers: layersInterface = []
  for(let layerNode of layersNodeArray) {
    const id = Number(layerNode.getAttribute("id") )
    const width = Number(layerNode.getAttribute("width") )
    const height = Number(layerNode.getAttribute("height") )
    const opacity = Number(layerNode.getAttribute("opacity") )
    const visible = Number(layerNode.getAttribute("visible") )
    
    const name = layerNode.getAttribute("name")
    if(name == "Units") { continue }
    const className = layerNode.getAttribute("class")
    
    const data = parseLayerData(layerNode)
    
    const layer: layerInterface = {
      id,
      width,
      height,
      opacity,
      visible,
      name,
      className,
      data,
    }
    
    layers.push(layer)
  }
  return layers
}