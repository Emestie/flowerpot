import { Color } from "../model/color";
import { Palette } from "../model/palette";
import { store } from "/@/redux/store";

const iterationPalette = new Palette({
    colors: [
        { default: new Color("#e5179e"), dark: new Color("#e5179e") },
        { default: new Color("#f08b24"), dark: new Color("#f08b24") },
        { default: new Color("#7209b7"), dark: new Color("#b249f7") },
        { default: new Color("#e75F64"), dark: new Color("#e75F64") },
        { default: new Color("#006466"), dark: new Color("#309496") },
        { default: new Color("#8A6426"), dark: new Color("#aA8446") },
        { default: new Color("#60ab8b"), dark: new Color("#80cbab") },
        { default: new Color("#e2aF32"), dark: new Color("#ffe420") },
        { default: new Color("#4865ff"), dark: new Color("#5875ff") },
        { default: new Color("#53c0d9"), dark: new Color("#53c0d9") },
        { default: new Color("#9Da373"), dark: new Color("#ADC393") },
        { default: new Color("#55a630"), dark: new Color("#55a630") },
        { default: new Color("#02BBFA"), dark: new Color("#02BBFA") },
        { default: new Color("#84b710"), dark: new Color("#c4f750") },
    ],
    getKind() {
        return store.getState().settings.darkTheme ? "dark" : "default";
    },
});

export { iterationPalette };
