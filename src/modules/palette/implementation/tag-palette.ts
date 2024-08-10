import { Color } from "../model/color";
import { Palette } from "../model/palette";

const tagPalette = new Palette({
    colors: [
        { default: new Color("#ADC393") },
        { default: new Color("#A0B7E5") },
        { default: new Color("#648DE5") },
        { default: new Color("#304E89") },
        { default: new Color("#FAC748") },
        { default: new Color("#FA8EAD") },
        { default: new Color("#02BBFA") },
        { default: new Color("#179AB4") },
        { default: new Color("#558C30") },
        { default: new Color("#0F4A11") },
        { default: new Color("#3772FF") },
        { default: new Color("#FF8204") },
        { default: new Color("#145DA0") },
        { default: new Color("#2D704B") },
        { default: new Color("#FFCF02") },
        { default: new Color("#EA6426") },
        { default: new Color("#3B4E37") },
        { default: new Color("#C49F86") },
        { default: new Color("#477699") },
        { default: new Color("#F97476") },
        { default: new Color("#D165B5") },
        { default: new Color("#5C4AE5") },
        { default: new Color("#17697B") },
        { default: new Color("#655B7C") },
        { default: new Color("#D73F44") },
        { default: new Color("#EC8F5E") },
        { default: new Color("#F3B564") },
        { default: new Color("#9FBB73") },
        { default: new Color("#BE3144") },
        { default: new Color("#F15941") },
        { default: new Color("#B0A695") },
        { default: new Color("#8B3EFF") },
    ],
    getKind() {
        return "default";
    },
});

export { tagPalette };
