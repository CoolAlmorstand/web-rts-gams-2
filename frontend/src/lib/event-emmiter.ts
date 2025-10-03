
import type { EventEmmiterInterface } from "$lib/interfaces"

export default class EventEmmiter implements EventEmmiterInterface {
  events: { [key: string]: Function[] } = {}
  
  constructor() {
    
  }
  snbsb 
  on(eventname: string, callback: Function){
    if(this.events[eventname] ) {
      this.events[eventname].push(callback)
    }
    else {
      this.events[eventname] = [callback]
    }
    
    return () => { 
      for(let i = 0; i < this.events[eventname].length; i++ ){
        if(this.events[eventname][i] == callback){
          this.events[eventname].splice(i, 1)
        }
      }
    }
  }
  
  emit(eventname: string, data: object) {
    for(let callback of this.events[eventname] ?? [] ) {
      callback(data)
    }
  }
}