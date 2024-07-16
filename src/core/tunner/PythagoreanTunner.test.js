import { assert } from "../../../test/assert.js";
import { PythagoreanTunner } from "./PythagoreanTunner.js";

suite("PythagoreanTunner.frequencyOfPitch", () => {
	test("outputs correct frequency based on D with A4 440", () => {
		const tunner = PythagoreanTunner.create({
			reference: { pitch: "A4", frequency: 440 },
		});

		assert.strictEqual(tunner.frequencyOfPitch("D4").toFixed(2), "293.33");
		assert.strictEqual(tunner.frequencyOfPitch("Eb4").toFixed(2), "309.03");
		assert.strictEqual(tunner.frequencyOfPitch("D#4").toFixed(2), "313.24");
		assert.strictEqual(tunner.frequencyOfPitch("Fb4").toFixed(2), "325.56");
		assert.strictEqual(tunner.frequencyOfPitch("E4").toFixed(2), "330.00");
		assert.strictEqual(tunner.frequencyOfPitch("F4").toFixed(2), "347.65");
		assert.strictEqual(tunner.frequencyOfPitch("E#4").toFixed(2), "352.40");
		assert.strictEqual(tunner.frequencyOfPitch("Gb4").toFixed(2), "366.25");
		assert.strictEqual(tunner.frequencyOfPitch("F#4").toFixed(2), "371.25");
		assert.strictEqual(tunner.frequencyOfPitch("G4").toFixed(2), "391.11");
		assert.strictEqual(tunner.frequencyOfPitch("F##4").toFixed(2), "396.45");
		assert.strictEqual(tunner.frequencyOfPitch("Ab4").toFixed(2), "412.03");
		assert.strictEqual(tunner.frequencyOfPitch("G#4").toFixed(2), "417.66");
		assert.strictEqual(tunner.frequencyOfPitch("Bbb4").toFixed(2), "434.08");
		assert.strictEqual(tunner.frequencyOfPitch("A4").toFixed(2), "440.00");
		assert.strictEqual(tunner.frequencyOfPitch("Bb4").toFixed(2), "463.54");
		assert.strictEqual(tunner.frequencyOfPitch("A#4").toFixed(2), "469.86");
		assert.strictEqual(tunner.frequencyOfPitch("Cb5").toFixed(2), "488.34");
		assert.strictEqual(tunner.frequencyOfPitch("B4").toFixed(2), "495.00");
		assert.strictEqual(tunner.frequencyOfPitch("C5").toFixed(2), "521.48");
		assert.strictEqual(tunner.frequencyOfPitch("B#4").toFixed(2), "528.60");
		assert.strictEqual(tunner.frequencyOfPitch("Db5").toFixed(2), "549.38");
		assert.strictEqual(tunner.frequencyOfPitch("C#5").toFixed(2), "556.87");
		assert.strictEqual(tunner.frequencyOfPitch("D5").toFixed(2), "586.67");
	});
});
