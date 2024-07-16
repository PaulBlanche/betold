import type { Pitch } from "./Pitch";
import type { Tunner } from "./Tunner";

type PythagoreanTunnerConfig = {
	reference: { pitch: Pitch; frequency: number };
};

interface PythagoreanTunnerCreator {
	create(config: PythagoreanTunnerConfig): Tunner;
}

export let PythagoreanTunner: PythagoreanTunnerCreator;
