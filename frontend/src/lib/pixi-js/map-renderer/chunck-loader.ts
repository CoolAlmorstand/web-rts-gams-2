

import { 
  Application, 
  Assets, 
  Sprite, 
  SCALE_MODES, 
  Text, 
  Texture, 
  Graphics, 
  Container, 
  Ticker, 
  Rectangle,
  RenderTexture
} from 'pixi.js';


export default class ChunkLoader {
  constructor(app: Application){
    this.app = app
  }
  
  hashGids(gids: number[]): string {
    if (gids.length === 1) return String(gids[0]);
    
    let result = String(gids[0]);
    for (let i = 1; i < gids.length; i++) {
      result += ',' + gids[i];
    }
    return result;
  }
  
  generateChunksTable(map, chunkSize = 16) {
    const ground = map.layers[0]
    
    const chunkRows = Math.ceil( ground.tiles.length / chunkSize )
    const chunkCols = Math.ceil(ground.tiles[0].length / chunkSize )
    
    console.log(`chunkRows: ${chunkRows}`)
    // key as stringified array of gid with val of array of the chunks thag has this gid
    const chunksTable: { 
      [key: string]: { 
        chunks: { chunkRow: number; chunkCol: number }[];
        gids: number[]
      }
    } = {}
    
    let uniqueGids = 0
    
    for(let chunkRow = 0; chunkRow < chunkRows; chunkRow++) {
      for(let chunkCol = 0; chunkCol < chunkCols; chunkCol++) {
        const gids = []
        
        // get gids of chunk
        const chunkRowEnd = (chunkRow * chunkSize) + chunkSize;
        for (let row = chunkRowEnd - chunkSize; row < Math.min(chunkRowEnd, ground.tiles.length); row++) {
          const chunkColEnd = (chunkCol * chunkSize) + chunkSize;
          for (let col = chunkColEnd - chunkSize; col < Math.min(chunkColEnd, ground.tiles[row].length); col++) {
            gids.push(ground.tiles[row][col]);
          }
        }
        
        
        console.log(`gidsLength: ${gids.length}`)
        const key = this.hashGids(gids)
        if(!chunksTable[key] ) {
          uniqueGids += 1
          chunksTable[key] = { chunks: [], gids }
        }
        chunksTable[key].chunks.push( {chunkRow, chunkCol} )
      }
    }
    console.log(`uniqueGids: ${uniqueGids}`)
    console.log(`totalChunks: ${ chunkRows * chunkCols}`)
    console.log(`saveRate ${ uniqueGids / ( chunkRows * chunkCols ) }`)
    return chunksTable
  }
  
  createChunkRenderTexture(chunksTable, tilesTexture, chunkSize) {
    //const rows = Math.ceil( ground.tiles.length / chunkSize )
    const chunks = []
    
    for(let chunkTable of Object.values(chunksTable) ) {
      const gids = chunkTable.gids
      const chunkContainer = new Container()
      
      for(let i = 0; i < gids.length; i++){
        const gid = gids[i]
        const tileSprite = new Sprite(tilesTexture[gid] )
        tileSprite.x = ( i % chunkSize ) * 20
        tileSprite.y = Math.floor(i / chunkSize) * 20
        chunkContainer.addChild(tileSprite)
      }
      
      const renderTexture = RenderTexture.create({
        width: 20 * chunkSize,
        height: 20 * chunkSize
      })
      
      this.app.renderer.render(chunkContainer, { renderTexture } )
      
      for(let chunck of chunkTable.chunks) {
        const chunkRow = chunck.chunkRow
        const chunkCol = chunck.chunkCol
        
        if(!chunks[chunkRow] ) { chunks[chunkRow] = [] }
        
        chunks[chunkRow][chunkCol] = renderTexture
      }
    }
    
    return chunks
  }
  
  generateChunks(map, tilesTexture) {
    const chunksTable = this.generateChunksTable(map)
    const chunks = this.createChunkRenderTexture(chunksTable, tilesTexture, 16)
    
    return chunks
  }
}