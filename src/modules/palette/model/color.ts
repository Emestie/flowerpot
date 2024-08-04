type TextColor = "light" | "dark";

export class Color {
    private hexValue: string;

    constructor(hexCode: string) {
        if (!hexCode.startsWith("#") || (hexCode.length !== 7 && hexCode.length !== 9))
            throw new Error("Invalid Color hex code: " + hexCode);

        this.hexValue = hexCode;
    }

    get hex() {
        return this.hexValue;
    }

    get rgb(): [number, number, number] {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.hexValue);

        return [parseInt(result?.[1] || "0", 16), parseInt(result?.[2] || "0", 16), parseInt(result?.[3] || "0", 16)];
    }

    get textColor(): TextColor {
        const luminance = this.getLuminanace(this.rgb);

        return luminance < 0.2 ? "light" : "dark";
    }

    private getLuminanace(rgbValues: [number, number, number]) {
        const rgb = rgbValues.map((v) => {
            const val = v / 255;
            return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
        });
        return Number((0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed(3));
    }
}
