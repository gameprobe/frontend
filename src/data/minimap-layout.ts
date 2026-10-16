import { at, rotatePoint } from "@/components/guide-map/geometry";
import type { Point } from "@/mocks/lineups";

export type MinimapSide = "attack" | "defense";
type Layout = { spawns: Record<MinimapSide, Point>; sites: { label: string; x: number; y: number }[] };

/** Valorant-API 13.08 snapshot, 2026-10-16. World Y -> image X, world X -> image Y.
 * Canonical 512px coordinates; runtime never contacts the external provider. */
export const MINIMAP_LAYOUTS: Record<string, Layout> = {
  "ascent": {
    "spawns": {
      "attack": {
        "x": 418.5062,
        "y": 291.3495
      },
      "defense": {
        "x": 67.4562,
        "y": 221.9907
      }
    },
    "sites": [
      {
        "label": "A",
        "x": 179.2308,
        "y": 72.9554
      },
      {
        "label": "B",
        "x": 146.1756,
        "y": 377.5112
      }
    ]
  },
  "bind": {
    "spawns": {
      "attack": {
        "x": 297.7352,
        "y": 490.5107
      },
      "defense": {
        "x": 264.6519,
        "y": 53.0907
      }
    },
    "sites": [
      {
        "label": "A",
        "x": 375.8813,
        "y": 170.7212
      },
      {
        "label": "B",
        "x": 149.4451,
        "y": 159.8401
      }
    ]
  },
  "breeze": {
    "spawns": {
      "defense": {
        "x": 364.479,
        "y": 107.5599
      },
      "attack": {
        "x": 222.015,
        "y": 447.1439
      }
    },
    "sites": [
      {
        "label": "B",
        "x": 35.647,
        "y": 195.3679
      },
      {
        "label": "A",
        "x": 464.831,
        "y": 253.6079
      }
    ]
  },
  "fracture": {
    "spawns": {
      "defense": {
        "x": 258.1228,
        "y": 226.1596
      },
      "attack": {
        "x": 247.2821,
        "y": 418.2696
      }
    },
    "sites": [
      {
        "label": "B",
        "x": 47.8597,
        "y": 265.217
      },
      {
        "label": "A",
        "x": 419.8949,
        "y": 267.3032
      }
    ]
  },
  "haven": {
    "spawns": {
      "attack": {
        "x": 458.3632,
        "y": 262.1931
      },
      "defense": {
        "x": 71.6017,
        "y": 215.9387
      }
    },
    "sites": [
      {
        "label": "A",
        "x": 205.5794,
        "y": 86.7993
      },
      {
        "label": "B",
        "x": 205.3631,
        "y": 256.704
      },
      {
        "label": "C",
        "x": 213.841,
        "y": 420.397
      }
    ]
  },
  "icebox": {
    "spawns": {
      "attack": {
        "x": 71.5848,
        "y": 300.6909
      },
      "defense": {
        "x": 496.4424,
        "y": 294.2397
      }
    },
    "sites": [
      {
        "label": "A",
        "x": 353.5944,
        "y": 391.9293
      },
      {
        "label": "B",
        "x": 330.5544,
        "y": 92.4093
      }
    ]
  },
  "lotus": {
    "spawns": {
      "defense": {
        "x": 295.4405,
        "y": 112.796
      },
      "attack": {
        "x": 261.5063,
        "y": 418.2318
      }
    },
    "sites": [
      {
        "label": "A",
        "x": 437.7166,
        "y": 184.7261
      },
      {
        "label": "B",
        "x": 257.4839,
        "y": 235.1379
      },
      {
        "label": "C",
        "x": 75.5947,
        "y": 223.7605
      }
    ]
  },
  "pearl": {
    "spawns": {
      "defense": {
        "x": 261.1278,
        "y": 26.0118
      },
      "attack": {
        "x": 222.0385,
        "y": 490.965
      }
    },
    "sites": [
      {
        "label": "A",
        "x": 468.4247,
        "y": 204.8696
      },
      {
        "label": "B",
        "x": 132.1825,
        "y": 237.3714
      }
    ]
  },
  "split": {
    "spawns": {
      "attack": {
        "x": 433.58,
        "y": 281.2029
      },
      "defense": {
        "x": 73.1753,
        "y": 271.6025
      }
    },
    "sites": [
      {
        "label": "A",
        "x": 161.1877,
        "y": 94.0352
      },
      {
        "label": "B",
        "x": 181.0103,
        "y": 443.7111
      }
    ]
  },
  "sunset": {
    "spawns": {
      "defense": {
        "x": 176.5635,
        "y": 112.0244
      },
      "attack": {
        "x": 240.0256,
        "y": 504.6144
      }
    },
    "sites": [
      {
        "label": "B",
        "x": 22.3744,
        "y": 287.9616
      },
      {
        "label": "A",
        "x": 383.7952,
        "y": 224.064
      }
    ]
  }
};

/** Choose a quarter turn that puts the selected spawn below the opposite spawn. */
export function minimapView(mapId: string, side: MinimapSide = "attack") {
  const layout = MINIMAP_LAYOUTS[mapId];
  let attackRotation = 0;
  if (layout) {
    const dx = layout.spawns.attack.x - layout.spawns.defense.x;
    const dy = layout.spawns.attack.y - layout.spawns.defense.y;
    attackRotation = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 90 : 270) : (dy >= 0 ? 0 : 180);
  }
  const rotation = (attackRotation + (side === "defense" ? 180 : 0)) % 360;
  const project = (point: Point, size = 512) => rotatePoint(point, rotation, size);
  const unproject = (point: Point, size = 512) => rotatePoint(point, -rotation, size);
  return {
    rotation, project, unproject,
    attributes: { "data-map-id": mapId, "data-map-side": side, "data-map-rotation": rotation },
    labelAt: (point: Point, offsetY: number) => {
      const shown = project(point);
      return at({ x: Math.max(60, Math.min(452, shown.x)), y: Math.max(14, Math.min(488, shown.y + offsetY)) });
    },
    at: (point: Point) => at(project(point)),
    imageStyle: { transform: `rotate(${rotation}deg)` },
  };
}
