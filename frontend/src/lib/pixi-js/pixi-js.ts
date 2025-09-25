
import DefualtEventEmmiter from "$lib/event-emmiter"
import twosides from "$lib/game/maps/twosides.tmx?raw"
import island from "$lib/game/maps/island.tmx?raw"
import test1 from "$lib/game/maps/test1.tmx?raw"
import track from "$lib/game/maps/track3.tmx?raw"


import type { 
  EventEmmiterInterface,
  RendererInterface
} from "$lib/interfaces"

import type {
  MapRendererInterface
} from "$lib/interfaces/map-renderer.ts"

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

import DefaultMapRenderer from "./map-renderer"


export class PixiEngine implements RendererInterface {
  event: EventEmmiterInterface;
  
  private app: Application = new Application();
  private center!: { x: number, y: number };
  
  
  constructor(
    EventEmmiter: new () => EventEmmiterInterface = DefualtEventEmmiter,
    MapRenderer: new () => MapRendererInterface = DefaultMapRenderer
  ) { 
    this.event = new EventEmmiter()
    this.mapRenderer = new MapRenderer(this.app)
  }
  
  async initialize(){

    await this.app.init({ 
      background: "rgb(201, 228, 180)",
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: false,
      roundPixels: true,
      resolution: window.devicePixelRatio,
      autoDensity: true
    })
    
    await this.loadMap()
    
    this.center = { 
      x: this.app.screen.width / 2,
      y: this.app.screen.height / 2
    }
    
    this.app.ticker.maxFPS = 60
    this.app.ticker.add((tick) => this.runTick(tick) )
  }
  
  loadMap() {
    this.mapRenderer.loadMap(twosides)
    this.app.stage.addChild(this.mapRenderer.mapContainer)
  }
  
  mountCanvas(container: HTMLElement) {
    container.appendChild( this.app.canvas )
  }
  
  private runTick(tick: Ticker) {  }
  
}

export default new PixiEngine()