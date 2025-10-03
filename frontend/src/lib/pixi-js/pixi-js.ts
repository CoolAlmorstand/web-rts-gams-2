
import DefualtEventEmmiter from "$lib/event-emmiter"
import twosides from "$lib/game/maps/twosides.tmx?raw"
import destiny from "$lib/game/maps/The_destiny_of_Shinyan_map.tmx?raw"
import earth from "$lib/game/maps/Earth_Open_Souroce.tmx?raw"
import island from "$lib/game/maps/island.tmx?raw"
import test1 from "$lib/game/maps/test1.tmx?raw"
import track from "$lib/game/maps/track3.tmx?raw"

import type { 
  EventEmmiterInterface,
  RendererInterface
} from "$lib/interfaces"
import type { MapRendererInterface } from "$lib/interfaces/map-renderer"
import type { ControlsInterface } from "$lib/interfaces/controls-interface"

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

import DefaultMapRenderer from "./map-renderer/map-renderer"
import DefaultControls from "./controls.ts"

export class PixiEngine implements RendererInterface {
  event: EventEmmiterInterface;
  
  private app: Application = new Application();
  private center!: { x: number, y: number };
  private worldContainer: Container = new Container()
  
  constructor(
    EventEmmiter: new () => EventEmmiterInterface = DefualtEventEmmiter,
    Controls: new () => ControlsInterface = DefaultControls,
    MapRenderer: new () => MapRendererInterface = DefaultMapRenderer
  ) { 
    this.event = new EventEmmiter()
    this.mapRenderer = new MapRenderer(this.app)
    this.controls = new Controls(this.app)
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
    
    this.center = { 
      x: this.app.screen.width / 2,
      y: this.app.screen.height / 2
    }
    this.worldContainer.pivot.set(this.center.x, this.center.y)
    this.worldContainer.position = this.center
    this.app.stage.addChild(this.worldContainer)
    
    this.controls.loadControls()
    await this.loadMap()
    
    // Create a Text object
    this.debugText = new Text("Hello World", {
        fontFamily: "Arial",
        fontSize: 36,
        fill: "white",
        align: "center"
    });
    
    this.debugText.x = 100;
    this.debugText.y = 50;

    this.app.stage.addChild(this.debugText);
    
    this.app.ticker.maxFPS = 50
    this.app.ticker.add((tick) => this.runTick(tick) )
  }
  
  loadMap() {
    this.mapRenderer.loadMap(earth, this.center)
    this.worldContainer.addChild( this.mapRenderer.mapContainer )
  }
  
  mountCanvas(container: HTMLElement) {
    container.appendChild( this.app.canvas )
  }
  
  private scaleWorld(scaleOffset) {
    const currentScale = this.worldContainer.scale.x 
    //const adjustedScaleOffset = currentScale + (scaleOffset * ( (currentScale / 1) **2 ) )
    const adjustedScaleOffset = currentScale + (scaleOffset * Math.clamp( (currentScale / 1), 0.05, 0.8) )
    this.worldContainer.scale.set(adjustedScaleOffset, adjustedScaleOffset)
  }
  
  private runTick(tick: Ticker) {  
    this.debugText.text = `fps: ${ (1000 / tick.elapsedMS).toFixed(0)}`
    
    const mapOffset = this.controls.getMapOffset()
    
    if( !( mapOffset.x == 0 && mapOffset.y == 0 && mapOffset.scaleOffset == 0 ) ) {
      this.scaleWorld(mapOffset.scaleOffset)
      this.mapRenderer.moveMap(mapOffset.x, mapOffset.y, this.worldContainer.scale.x )
    }
  }
  
}

export default new PixiEngine()