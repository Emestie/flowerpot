import { Color } from "./color";

type ColorDictionary = { default: Color; [kind: string]: Color }[];

export class Palette {
    private colors: ColorDictionary;
    private getKind: () => string;

    constructor(classInitData: { colors: ColorDictionary; getKind: () => "default" | string }) {
        this.colors = classInitData.colors;
        this.getKind = classInitData.getKind;
    }

    getColor(text: string): Color {
        const letters = text.split("");
        const charcodes = letters.map((x) => x.charCodeAt(0));
        const sum = charcodes.reduce((prev, next) => next + prev, 0);

        return this.getColorByIndex(sum);
    }

    getColorByIndex(index: number): Color {
        const colorRec = this.colors[index % this.colors.length];

        return colorRec[this.getKind()] || colorRec.default;
    }
}
