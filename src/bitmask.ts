import { reduce } from 'lodash';

const tiles: {
    [key: string]: {
        variants: Array<number>;
        bitmaskNumbers: Array<number>;
    };
} = {
    pillar_both: {
        variants: [12],
        bitmaskNumbers: [48]
    },
    pillar_left: {
        variants: [11, 10],
        bitmaskNumbers: [16]
    },
    pillar_right: {
        variants: [48, 35],
        bitmaskNumbers: [32]
    },
    void: {
        variants: [47],
        bitmaskNumbers: [0]
    },
    error: {
        variants: [52],
        bitmaskNumbers: [256]
    },
    wall: {
        variants: [34, 21],
        bitmaskNumbers: [
            17,
            33,
            49,
            68,
            85,
            101,
            117,
            132,
            149,
            161,
            165,
            181,
            196,
            213,
            229,
            245
        ]
    },
    wall_continue_left_corner: {
        variants: [8],
        bitmaskNumbers: [64, 80, 224]
    },
    wall_continue_left_corner_right: {
        variants: [46],
        bitmaskNumbers: [104, 120]
    },
    wall_continue_left_corner_right_right: {
        variants: [33],
        bitmaskNumbers: [56, 152, 216]
    },
    wall_continue_right_corner: {
        variants: [20],
        bitmaskNumbers: [128, 160]
    },
    wall_continue_right_corner_left: {
        variants: [7, 45],
        bitmaskNumbers: [50, 146, 178]
    },
    wall_corner_both: {
        variants: [32, 19],
        bitmaskNumbers: [192]
    },
    wall_corner_left: {
        variants: [6, 44],
        bitmaskNumbers: [76, 92, 148, 156, 220, 221]
    },
    wall_corner_left_down: {
        variants: [31, 18],
        bitmaskNumbers: [25, 89, 57, 97, 105, 113, 121]
    },
    wall_corner_left_down_corner_right: {
        variants: [5, 43],
        bitmaskNumbers: [96]
    },
    wall_corner_right: {
        variants: [30, 17],
        bitmaskNumbers: [100, 102, 134, 166, 183, 198, 228, 230, 231, 247]
    },
    wall_corner_right_corner_left: {
        variants: [4],
        bitmaskNumbers: [98, 194, 226]
    },
    wall_corner_right_corner_left_up: {
        variants: [42, 29],
        bitmaskNumbers: [144]
    },
    wall_corner_right_down: {
        variants: [16, 3],
        bitmaskNumbers: [35, 51, 145, 147, 163, 177, 179]
    },
    wall_left_continue: {
        variants: [41],
        bitmaskNumbers: [24, 72, 88]
    },
    wall_pillar_left: {
        variants: [28, 15],
        bitmaskNumbers: [125, 204, 212, 253]
    },
    wall_right_continue: {
        variants: [2],
        bitmaskNumbers: [34, 162, 130]
    },
    wall_single: {
        variants: [40, 27],
        bitmaskNumbers: [206]
    },
    wall_single_alone: {
        variants: [14, 1],
        bitmaskNumbers: [124, 182, 214, 222, 238, 239, 246, 252, 254, 255]
    },
    wall_top_continue: {
        variants: [39, 26],
        bitmaskNumbers: [58, 106, 122, 154, 186, 200, 202, 218, 234, 250]
    },
    wall_top_end: {
        variants: [13, 0],
        bitmaskNumbers: [123, 187, 217, 243, 249, 251]
    }
};

const bitmaskToWallTileIndex: {
    [key: number]: {
        tileName: string;
        variants: Array<number>;
    };
} = reduce(
    tiles,
    (acc, { variants, bitmaskNumbers }, tileName) => {
        bitmaskNumbers.forEach(bitmask => {
            acc[bitmask] = {
                tileName,
                variants
            };
        });
        return acc;
    },
    {}
);

export function getWallTilesByBitmask(bitmask) {
    return bitmaskToWallTileIndex[bitmask] || bitmaskToWallTileIndex[256];
}
