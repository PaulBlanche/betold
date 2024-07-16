import type { Pitch } from "./Pitch";
import type { Tunner } from "./Tunner";

export type Tet = 12 | 19 | 24 | 31;

type TetTunnerConfig = {
	tet: Tet;
	reference: { pitch: Pitch; frequency: number };
};

interface TetTunnerCreator {
	create(config: TetTunnerConfig): Tunner;
}

export let TetTunner: TetTunnerCreator;
