

export interface tileFrame {
  gid: number;
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
}

export type SpriteSheetLoader = { [key: string]: () => Promise<{ default: string }> };
export type TilesetLoader = { [key: string]: () => Promise<string> };

export interface tilesetInterface {
  firstGid: number;
  tileWidth: number;
  tileHeigth: number;
  cols: number;
  rows; number;
  image: HTMLImageElement;
  tileFrames: { [key: number]: tileFrame };
  
  spacing?: number;
  margin?: number;
  className?: string;
  objectAlignment?: string;
  tileCount?: number;
  name?: string;
}

export interface layerInterface {
  data: number[];
  
  name?: string;
  width?: number;
  height?: number;
  id?: number;
  Tileoffset?: {x: number, y; number };
  pixelOffset?: {x number, y; number };
  opacity?: number,
  visible?: bool;
  class?: string;
  
  
}

export interface tilesetMapInterface = {
  [key: number]: tilesetInterface
}

export type layersInterface = layerInterface[]

export interface mapInterface {
  name: string;
  width: number;
  height: number;
  tilesetMap: tilesetMapInterface:
  layers: layersInterface;
  
  tileWidth?: number;
  tileHeigth?: number;
  orientation?: string;
  renderorder?: string;
}

export interface mapParserInterface {
  parseMap(tmxString: string): mapInterface;
}