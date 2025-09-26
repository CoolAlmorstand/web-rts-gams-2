

import DefaultEventEmmiter from "$lib/event-emmiter"
import DefaultMapParser from "$lib/game/map-parser2/map-parser"


import type { EventEmmiterInterface } from "$lib/interfaces"
import type { mapParserInterface } from "$lib/interfaces/map-parser"
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


export default class MapRenderer {
  event: EventEmmiterInterface
  mapParser: mapParserInterface
  private container: Container = new Container()
  private mapContainer: Container = new Container()
  
  constructor(
    app: Application,
    EventEmmiter: new () => EventEmmiterInterface = DefaultEventEmmiter,
    MapParser: new () => mapParserInterface = DefaultMapParser
  ) {
    this.app = app
    this.event = new EventEmmiter()
    this.mapParser = new MapParser()
  }
  
  async loadTileTextures(map) {
    const mapTiles: { [key: number]: Texture } = {}
    for(let tileset of Object.values(map.tilesetMap) ) {
      const firstGid = tileset.firstGid
      const image = tileset.image
      const imageWidth = image.naturalWidth 
      const imageHeight = image.naturalHeight 
      const totalColumns = imageWidth / tileset.tileWidth 
      const totalRows = imageHeight / tileset.tileHeight
      
      const baseTexture = await Assets.load(image)
      
      for(let frame of Object.values(tileset.frames) ) {
        const { xStart, yStart } = frame
        const rect = new Rectangle(xStart, yStart, 20, 20 )
        const texture = new Texture( { source: baseTexture, frame: rect } )
        mapTiles[firstGid + frame.id] = texture 
      }
    }
    
    return mapTiles
  }
  
  renderMapTest(map, tilesTexture) {
    
    const ground = map.layers[0]
    const width = map.width
    for(let row = 0; row < ground.tiles.length; row++ ) {
      for(let col = 0; col < ground.tiles[row].length; col ++) {
        const gid = ground.tiles[row][col]
        const tileSprite = new Sprite(tilesTexture[gid] )
        this.mapContainer.addChild(tileSprite)
      }
    }
  }
  
  renderMap(chunkTextures){
    this.mapContainer.scale.set(0.5)
    console.log(chunkTextures)
    for(let row = 0; row < chunkTextures.length; row++) {
      for(let col = 0; col < chunkTextures[row].length; col++) {
        const chunkRenderTexture = chunkTextures[row][col]
        const sprite = new Sprite(chunkRenderTexture)
        sprite.x = col * 20 * 16
        sprite.y = row * 20 * 16
        this.mapContainer.addChild(sprite)
      }
    }
  }
  
  renderMapRaw(map, tilesTexture) {
    const ground = map.layers[0]
    for(let row = 0; row < ground.tiles.length; row++) {
      for(let col = 0; col < ground.tiles[row].length; col++) {
        const gid = ground.tiles[row][col]
        const texture = tilesTexture[gid]
        const tileSprite = new Sprite(texture)
        console.log(gid)
        tileSprite.x = col * 20
        tileSprite.y = row * 20
        this.mapContainer.addChild(tileSprite)
      }
    }
  }
  
  generatechunks(map, tilesTexture, chunkSize = 16) {
    const ground = map.layers[0]
    const width = map.width
    const rows = Math.ceil( ground.tiles.length / chunkSize )
    const chunks = Array.from({ length: rows }, () => [] );
    
    for(let row = 0; row < ground.tiles.length; row++ ) {
      for(let col = 0; col < ground.tiles[row].length; col ++) {
        const gid = ground.tiles[row][col]
        const chunkRow = Math.floor(row / chunkSize)
        const chunkCol = Math.floor(col / chunkSize)
        
        if(!chunks[chunkRow][chunkCol]) { 
          chunks[chunkRow][chunkCol] = new Container()
          //chunks[chunkRow][chunkCol].x = chunkCol * 20 * chunkSize
          //chunks[chunkRow][chunkCol].y = chunkRow * 20 * chunkSize
        }
        const tileSprite = new Sprite(tilesTexture[gid] )
        
        tileSprite.y = ( row % chunkSize ) * 20
        tileSprite.x = ( col % chunkSize ) * 20
        
        chunks[chunkRow][chunkCol].addChild(tileSprite)
      }
    }
    return chunks
  }
  
  createChunkRenderTexture(chunks) {
    const chunkTextures = Array.from({ length: chunks.length }, () => [] )
    for(let row = 0; row < chunks.length; row++ ) {
      for(let col = 0; col < chunks[row].length; col++) {
        const chunkContainer = chunks[row][col]
        const renderTexture = RenderTexture.create({
          width: 20 * 16,
          height: 20 * 16
        })
        this.app.renderer.render(chunkContainer, { renderTexture } )
        
        chunkTextures[row][col] = renderTexture
      }
    }
    
    return chunkTextures
  }
  
  async loadMap(mapTmx: string) {
    this.map = await this.mapParser.parseMap(mapTmx)
    this.tilesTexture = await this.loadTileTextures(this.map)
    this.chunks = this.generatechunks(this.map, this.tilesTexture, 16)
    this.chunksRenderTexture = this.createChunkRenderTexture(this.chunks)
    this.renderMap(this.chunksRenderTexture)
    //this.renderMapRaw(this.map, this.tilesTexture)
    //this.renderMapTest(this.map, this.tilesTexture)
  }
  
}