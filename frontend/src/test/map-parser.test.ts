import { describe, it, expect, vi } from 'vitest'
import { 
  getFileName, 
  loadImage, 
  loadTileset, 
  parseLoadedTileset,
  getFrameSlices
} from '../lib/game/map-parser2/tilesets-parser'
import { MapParser } from  '../lib/game/map-parser2/map-parser'

describe("findFileName",() => {
  it("isolates the file name from path", () => {
    expect(getFileName("/dir1/dir2/myFile.txt")).toBe("myFile.txt")
  })
})

describe("loadImage", () => {
  it("creates an Image with the correct src", async () => {
    // Mock loader returns a fake module with default URL
    const fakeLoader = vi.fn(async () => ({ default: "/src/lib/assets/tilesets/rusted-warfare/bitmaps/dirt.png" }))
    const spriteSheets = {
      "/src/lib/assets/tilesets/rusted-warfare/bitmaps/dirt.png": fakeLoader
    }

    // Fake tileset element
    const loadedTileset = document.createElement("tileset")
    loadedTileset.setAttribute("name", "Test Tileset")
    const imageNode = document.createElement("image")
    imageNode.setAttribute("source", "bitmaps/dirt.png")
    loadedTileset.appendChild(imageNode)

    const sprite = await loadImage(loadedTileset, spriteSheets)
    expect(fakeLoader).toHaveBeenCalled()          // loader was called
    expect(sprite).toBeInstanceOf(Image)           // returns an Image object
    expect(sprite.src).toContain("dirt.png")   // src is set correctly
  })

  it("throws an error if no image node is found", async () => {
    const loadedTileset = document.createElement("tileset")
    loadedTileset.setAttribute("name", "No Image Tileset")

    await expect(loadImage(loadedTileset, {})).rejects.toThrow(
      "tileset: No Image Tileset has no image node"
    )
  })
})

describe("loadedTileset", () => {
  
  it("loadsATileset", async () => {
    const tilesetLoader = import.meta.glob("/src/lib/assets/tilesets/rusted-warfare/tilesets/*/*.tsx", {as: "raw" } )
    const SpriteSheetLoader = import.meta.glob("/src/lib/assets/tilesets/rusted-warfare/bitmaps/*.png")
    
    const tilesetNode = document.createElement("tileset")
    tilesetNode.setAttribute("source", "terrain/Ice.tsx")
    
    const loadedTileset = await loadTileset(tilesetNode, tilesetLoader)
    const parsedTileset = await parseLoadedTileset(loadedTileset, SpriteSheetLoader)
  })
})

describe("findUsedTilesets", () => {
  it("returns firstGids of usedTilesets", () => {
    const mockLayers = [
      { data: [3, 7, 12] },
      { data: [1, 8, 25, 180] },
    ]
    const mockTilesetsNodeArray: Element[] = [
      {
        getAttribute: (name: string) =>
          name === "firsgid" ? "1" : null,
      } as unknown as Element,
      {
        getAttribute: (name: string) =>
          name === "firsgid" ? "5" : null,
      } as unknown as Element,
      {
        getAttribute: (name: string) =>
          name === "firsgid" ? "10" : null,
      } as unknown as Element,
      {
        getAttribute: (name: string) =>
          name === "firsgid" ? "20" : null,
      } as unknown as Element,
      {
        getAttribute: (name: string) =>
          name === "firsgid" ? "40" : null,
      } as unknown as Element,
      {
        getAttribute: (name: string) =>
          name === "firsgid" ? "60" : null,
      } as unknown as Element,
      {
        getAttribute: (name: string) =>
          name === "firsgid" ? "120" : null,
      } as unknown as Element,
    ];
    
    const mapParser = new MapParser()
    expect(mapParser.findUsedTilesets(mockTilesetsNodeArray, mockLayers)).toStrictEqual(["1", "5", "10", "20", "120"])
  })
})

describe.only("getFrameSlices", () => {
  it("gets the frame slices of an image", () => {
    const expectedOutput = {
      0: {
        id: 0,
        xStart: 0,
        xEnd: 20,
        yStart: 0,
        yEnd: 20
      },
      1: {
        id: 1,
        xStart: 20,
        xEnd: 40,
        yStart: 0,
        yEnd: 20
      },
      2: {
        id: 2,
        xStart: 40,
        xEnd: 60,
        yStart: 0,
        yEnd: 20
      },
      3: {
        id: 3,
        xStart: 0,
        xEnd: 20,
        yStart: 20,
        yEnd: 40
      },
      4: {
        id: 4,
        xStart: 20,
        xEnd: 40,
        yStart: 20,
        yEnd: 40
      },
      5: {
        id: 5,
        xStart: 40,
        xEnd: 60,
        yStart: 20,
        yEnd: 40
      }
    }
    const result = getFrameSlices(3, 2, 20, 20)
    expect(result).toStrictEqual(expectedOutput)
  })
})