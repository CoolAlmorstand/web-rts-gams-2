

import eventEmmiter from "$lib/event-emmiter"
import parseMap from "$lib/game/map-parser/map-parser"


import type { EventEmmiterInterface } from "$lib/interfaces"
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


export class MapRenderer() {
  event: EventEmmiterInterface
  private container: Container = new Container()
  
  constructor(
    EventEmmiter: new () => EventEmmiterInterface = DefualtEventEmmiter
  ) {
    this.event = new EventEmmiter()
  }
  
  async loadMap() {
    
  }
  
}