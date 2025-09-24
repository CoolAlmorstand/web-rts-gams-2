
import DefualtEventEmmiter from "$lib/event-emmiter"
import twosides from "$lib/game/maps/twosides.tmx?raw"
import island from "$lib/game/maps/island.tmx?raw"
import test1 from "$lib/game/maps/test1.tmx?raw"
import track from "$lib/game/maps/track3.tmx?raw"
import MapParser from "$lib/game/map-parser2/map-parser"

import type { 
  EventEmmiterInterface,
  RendererInterface
} from "$lib/interfaces"

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
  Rectangle
} from 'pixi.js';




export class PixiEngine implements RendererInterface {
  event: EventEmmiterInterface;
  
  private app: Application = new Application();
  private center!: { x: number, y: number };
  private mapContainer: Container = new Container()
  
  constructor(
    EventEmmiter: new () => EventEmmiterInterface = DefualtEventEmmiter
  ) { 
    this.event = new EventEmmiter()
  }
  
  async initialize(){

    await this.loadMap()
    
    await this.app.init({ 
      background: "rgb(201, 228, 180)",
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: false,
      roundPixels: true,
      resolution: window.devicePixelRatio,
      autoDensity: true
    })
    
    this.renderMap2()
    
    this.center = { 
      x: this.app.screen.width / 2,
      y: this.app.screen.height / 2
    }
    
    
    
    this.app.ticker.maxFPS = 60
    this.app.ticker.add((tick) => this.runTick(tick) )
  }
  mountCanvas(container: HTMLElement) {
    container.appendChild( this.app.canvas )
  }
  
  private runTick(tick: Ticker) {  }
  
  private async loadTileTextures(map) {
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
  
  private async loadMap() {
    const mapParser = new MapParser()
    this.map = await mapParser.parseMap(twosides)
    this.tilesTexture = await this.loadTileTextures(this.map)
  }
  
  private renderMap2(){
    
    this.mapContainer.scale.set(0.25)
    const width = this.map.width
    for(let i = 0; i < this.map.layers[0].data.length; i++ ) {
      const gid = this.map.layers[0].data[i]
      const tile = new Sprite( this.tilesTexture[gid] )
      tile.x = 20 * (i % width)
      tile.y = 20 * Math.floor(i / width)
      this.mapContainer.addChild(tile)
    }
    //const mapSnapshot = new Sprite( this.app.renderer.generateTexture(this.mapContainer) )
    this.app.stage.addChild(this.mapContainer)

    
  }
}

export default new PixiEngine()