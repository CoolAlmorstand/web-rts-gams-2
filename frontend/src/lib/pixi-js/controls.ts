

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
  RenderTexture,
  FederatedPointerEvent
} from 'pixi.js';

import DefualtEventEmmiter from "$lib/event-emmiter"

export default class Controls {
  
  controlsContainer: Container = new Container()
  
  // total chnage in controls from last frame to the next
  controlsChange: { x: number, y: number, scale: number }
  pointer1: { 
    event, x: number, y: number, xOffset: number, yOffset: number,
    id, time: number, isClick: bool, isActive: bool
  } = {
    event: null,
    xOffset: 0,
    yOffset: 0,
    x: null,
    y: null,
    id: null,
    time: null,
    isClick: true,
    isActive: false
  }
  pointer2: { 
    event, x: number, y: number, xOffset: number, yOffset:  number,
    id, time: number, isClick: bool, isActive: bool
  } = {
    event: null,
    xOffset: 0,
    yOffset: 0,
    x: null,
    y: null,
    id: null,
    time: null,
    isClick: true,
    isActive: false
  }
  
  //private activeTouches: { [key: number]: {event, time: number } }
  
  constructor(
    app: Application,
    EventEmmiter: new () => EventEmmiterInterface = DefualtEventEmmiter
  ) {
    this.app = app
    this.event = new EventEmmiter()
  }
  
  loadControls() {
    this.initializeTouchControls()
  }
  
  initializeTouchControls() {
    const stage = this.app.stage
    
    stage.interactive = true
    stage.hitArea = this.app.renderer.screen
    
    stage.on("pointerdown", (event) => {
      this.assignPointers(event)
    })
    
    stage.on("pointermove", (event) => {
      const pointer = this.getPointerById(event.pointerId)
      if(!pointer) { return }
      pointer.event = event
      pointer.xOffset += event.movement.x
      pointer.yOffset += event.movement.y
    })
    
    stage.on("pointerup", (event) => {
      const id = event.pointerId
      const pointer = this.getPointerById(id)
      this.removePointerById(id)
      
      if(!pointer || !pointer.isClick ) { return }
      
      const timeDeltaMs = performance.now() - pointer.time
      
    })
  }
  
  removePointerById(id) {
    if(this.pointer1.id == id) { 
      this.pointer1.isActive = false 
    }
    if(this.pointer2.id == id) { 
      this.pointer2.isActive = false 
    }
  }
  
  getPointerById(id) {
    if(this.pointer1.id == id) { return this.pointer1 }
    if(this.pointer2.id == id) { return this.pointer2 }
  }
  
  assignPointers(event) {
    if(!this.pointer1.isActive) {
      this.pointer1.event = event
      this.pointer1.x = event.global.x
      this.pointer1.y = event.global.y
      this.pointer1.id = event.pointerId
      this.pointer1.time = performance.now()
      this.pointer1.isActive = true
    } 
    else if(!this.pointer2.isActive) {
      this.pointer2.event = event
      this.pointer2.x = event.global.x
      this.pointer2.y = event.global.y
      this.pointer2.id = event.pointerId
      this.pointer2.time = performance.now()
      this.pointer2.isActive = true
    }
    else {
      this.pointer1.event = event
      this.pointer1.x = event.global.x
      this.pointer1.y = event.global.y
      this.pointer1.id = event.pointerId
      this.pointer1.time = performance.now()
      this.pointer1.isActive = true
    }
  }
  
  getPanOffset() {
    let xOffset = Math.abs(this.pointer1.xOffset) <= Math.abs(this.pointer2.xOffset) ? this.pointer1.xOffset :  this.pointer2.xOffset 
    let yOffset = Math.abs(this.pointer1.yOffset) <= Math.abs(this.pointer2.yOffset) ? this.pointer1.yOffset :  this.pointer2.yOffset 
    
    if(this.pointer1.xOffset * this.pointer2.xOffset < 0) {
      xOffset = 0
    }
    
    if(this.pointer1.yOffset * this.pointer2.yOffset < 0) {
      yOffset = 0
    }
    
    return { xOffset, yOffset }
  }
  
  getMapOffset() {
    
    const { xOffset, yOffset } = this.getPanOffset()
    
    const pointer1NewX = this.pointer1.x + this.pointer1.xOffset
    const pointer1NewY = this.pointer1.y + this.pointer1.yOffset
    const pointer2NewX = this.pointer2.x + this.pointer2.xOffset
    const pointer2NewY = this.pointer2.y + this.pointer2.yOffset
    
    const previusDistance = Math.sqrt( ( (this.pointer1.x - this.pointer2.x) ** 2 ) + ( (this.pointer1.y - this.pointer2.y) ** 2 ) )
    const newDistance = Math.sqrt( ( (pointer1NewX - pointer2NewX) ** 2 ) + ( (pointer1NewY - pointer2NewY) ** 2 ) )
    const distanceDelta = newDistance - previusDistance
    
    const scaleOffset = this.pointer1.isActive && this.pointer2.isActive ? ( distanceDelta / 300 ) : 0
    
    this.pointer1.x = pointer1NewX
    this.pointer1.y = pointer1NewY
    this.pointer2.x = pointer2NewX
    this.pointer2.y = pointer2NewY
    
    this.pointer1.xOffset = 0
    this.pointer1.yOffset = 0
    this.pointer2.xOffset = 0
    this.pointer2.yOffset = 0
    
    return { x: xOffset, y: yOffset, scaleOffset, }
  }
}