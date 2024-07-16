export type Pulse = {
	type: "pulse";
	voice?: number;
};

export type Note = {
	type: "note";
	voice?: number;
	frequency: number;
	velocity?: number;
	portamento?: number;
	pan?: number;
};

export type Attack = {
	type: "attack";
	voice?: number;
};

export type Release = {
	type: "release";
	voice?: number;
};

declare module "./core/node/MessageNode.js" {
	interface Messages {
		note: Note;
		attack: Attack;
		pulse: Pulse;
		release: Release;
	}
}
