

import DefaultEventEmmiter from "$lib/event-emmiter"

import DefaultMapParser from "$lib/game/map-parser2/map-parser"
import DefaultChunckLoader from "./chunck-loader"

import type { EventEmmiterInterface } from "$lib/interfaces"
import type { mapParserInterface } from "$lib/interfaces/map-parser"
import type { ChunckLoaderInterface } from "$lib/interfaces/chunck-loader"
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

//todo list:
// add support for zoom and panning
// add a config
// replace magic values with values from config
// add support for rendering other layers othrr than ground
// render only visiblr parts of the map
// apply lvl of detail rendering based on zoom lvl
// fix all the ts and add proper type and interface safety


export default class MapRenderer {
  event: EventEmmiterInterface
  mapParser: mapParserInterface
  mapContainer: Container = new Container()
  chunkSpriteArray: Sprite[] = []
  visibleChunks: Sprite[] = []
  scale: number = 1
  constructor(
    app: Application,
    EventEmmiter: new () => EventEmmiterInterface = DefaultEventEmmiter,
    MapParser: new () => mapParserInterface = DefaultMapParser,
    ChunckLoader: new () => ChunckLoaderInterface = DefaultChunckLoader
  ) {
    this.app = app
    this.event = new EventEmmiter()
    this.chunckLoader = new ChunckLoader(this.app)
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
  
  renderMap(chunkTextures ) {
    this.mapContainer.scale.set(1, 1)
    for(let row = 0; row < chunkTextures.length; row++) {
      for(let col = 0; col < chunkTextures[row].length; col++) {
        const chunkRenderTexture = chunkTextures[row][col]
        const sprite = new Sprite(chunkRenderTexture)
        if(!this.chunkSpriteArray[row]) { this.chunkSpriteArray[row] = [] }
        this.chunkSpriteArray[row][col] = sprite
        sprite.x = col * 20 * 16
        sprite.y = row * 20 * 16
        sprite.visible = false
        this.mapContainer.addChild(sprite)
      }
    }
    
    this.moveMap(0, 0, 1)
  }
  
  renderMapRaw(map, tilesTexture) {
    const ground = map.layers[0]
    for(let row = 0; row < ground.tiles.length; row++) {
      for(let col = 0; col < ground.tiles[row].length; col++) {
        const gid = ground.tiles[row][col]
        const texture = tilesTexture[gid]
        const tileSprite = new Sprite(texture)
        
        tileSprite.x = col * 20
        tileSprite.y = row * 20
        this.mapContainer.addChild(tileSprite)
      }
    }
  }
  
  findVisibleSection(map: any, scale: number, chunckSize: number = 16) {
    const width = this.app.screen.width * (1 / scale)
    const height = this.app.screen.height * (1 / scale)
  
    const AdjustedChunckSize = chunckSize * 20
    
    const widthZoomGap = scale < 1 ? ( ( 1 - scale ) / 2 ) * width : 0
    const heightZoomGap = scale < 1 ? ( ( 1 - scale ) / 2 ) * height : 0
  
    const x = ( this.mapContainer.x * -1 ) - widthZoomGap
    const y = ( this.mapContainer.y * -1 ) - heightZoomGap
    
    const startCol =  Math.max( Math.floor(x / AdjustedChunckSize) - 1 , 0 )
    const endCol = Math.min( Math.floor( ( x + width ) / AdjustedChunckSize), this.chunkSpriteArray[0].length - 1 )
    
    const startRow = Math.max( Math.floor(y / AdjustedChunckSize) - 1, 0 )
    const endRow = Math.min( Math.floor( ( y + height ) / AdjustedChunckSize), this.chunkSpriteArray.length - 1 )
    
    const visibleChunks = []
    for(let row = startRow; row <= endRow; row++) {
      for(let col = startCol; col <= endCol; col++) {
        const chunk = this.chunkSpriteArray[row][col]
        visibleChunks.push( chunk ) 
      }
    }
    return visibleChunks
  }
  
  updateVisibleChunks(visibleChunks) {
    for(let chunk of this.visibleChunks) {
      if(!visibleChunks.includes(chunk) ) {
        chunk.visible = false
      }
    }
    
    for(let chunk of visibleChunks) {
      chunk.visible = true
    }
  }
  
  moveMap(x, y, scale) {
    
    this.mapContainer.x += x * ( 1 / scale) * 1.2
    this.mapContainer.y += y * ( 1 / scale) * 1.2
    
    const visibleChunks = this.findVisibleSection(this.map, scale, 16)
    this.updateVisibleChunks(visibleChunks)
    this.visibleChunks = visibleChunks
  }
  
  async loadMap(mapTmx: string, center) {
    this.map = await this.mapParser.parseMap(mapTmx)
    this.tilesTexture = await this.loadTileTextures(this.map)
    
    this.chunksRenderTexture = this.chunckLoader.generateChunks(this.map, this.tilesTexture)
    
    this.renderMap(this.chunksRenderTexture)
    //this.renderMapRaw(this.map, this.tilesTexture)
  }
  
}