import { RocketFlags } from '../../components/ui/Rocket';
import RocketBtn from './RocketBtn';

export default [
    // First layer
    [
        new RocketBtn({
            offset: 5, dummySize: 10,
            size: 12.5, damage: 1.25,
            flags: RocketFlags.None
        }, 1, true),

        new RocketBtn({
            offset: 5, dummySize: 9,
            size: 12.5, speed: 2, damage: 0.6, gravity: 0.5,
            onSpawn: r => r.penetration = 4,
            flags: RocketFlags.Long
        }, 4),

        new RocketBtn({
            offset: 5, dummySize: 11.5,
            size: 20, speed: 0.6, damage: 3,
            flags: RocketFlags.Hammer
        }, 8),

        new RocketBtn({
            offset: -3, dummySize: 8,
            size: 8, speed: 1.5, damage: 0.5,
            flags: RocketFlags.Sharp
        }, 0.125),

        new RocketBtn({
            offset: 6, dummySize: 13,
            size: 60, speed: 0.2, damage: 90, gravity: 0.1,
            flags: RocketFlags.White
        }, 90)
    ],
    // Second layer (elites)
    [
        new RocketBtn({
            offset: 5, dummySize: 8,
            size: 15, speed: 3, damage: 0.4, gravity: 0,
            onSpawn: r => r.penetration = 8,
            flags: RocketFlags.Longer
        }, 12),

        new RocketBtn({
            offset: -4, dummySize: 7,
            size: 7, speed: 2, damage: 0.5,
            onSpawn: r => r.spawnClones(24, false),
            flags: RocketFlags.Triangle
        }, 5),

        new RocketBtn({
            offset: 5, dummySize: 7,
            size: 10, speed: 4, damage: 0.3, gravity: 0,
            onSpawn: r => r.penetration = 16,
            flags: RocketFlags.Long | RocketFlags.Longer
        }, 30)
    ],
    /* Third layer (removed elites)
    [
        new RocketBtn({
            offset: 5, dummySize: 7,
            size: 10, speed: 4, damage: 0.3, gravity: 0,
            onSpawn: r => { r.penetration = 16; r.spawnClones(2, true); },
            flags: RocketFlags.Long | RocketFlags.Longer | RocketFlags.White
        }, 1)
    ]
    */
];