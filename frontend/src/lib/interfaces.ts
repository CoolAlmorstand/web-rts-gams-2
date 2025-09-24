

export interface EventEmmiterInterface {
  on(eventName: string, callback: Function): Function;
  emit(eventName: string, data: object): void;
  events: object;
}

export interface RendererInterface {
  event: EventEmmiterInterface;
  mountCanvas?(container: HTMLElement): void;
}

export interface TilesetInterface {
  firstGid: number;
  name: string;
  tileWidth: number;
  tileHeight: number;
  spacing: number;
  margin: number;
  columns: number;
  image: HTMLImageElement;
}

export interface TileSetMapInterface {
  [key: number]: TilesetInterface
}




