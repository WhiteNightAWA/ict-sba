import {autoPlay} from "react-swipeable-views-utils";
import SwipeableViews from "react-swipeable-views";
import {Uploader} from "uploader";

export const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
export function flattenObject(obj, prefix = "") {
    let result = [];
    for (let key in obj) {
        let value = obj[key];
        if (typeof value === "object" && !Array.isArray(value)) {
            result = result.concat(flattenObject(value, prefix + key + " > "));
        } else if (Array.isArray(value)) {
            for (let item of value) {
                result.push(prefix + key + " > " + item);
            }
        } else {
            result.push(prefix + key + " > " + value);
        }
    }
    return result;
}
export function transformObject(obj, prefix = "") {
    let result = [];

    for (let key in obj) {
        const currentKey = prefix ? `${prefix} > ${key}` : key;
        result.push(currentKey);

        const value = obj[key];

        if (Array.isArray(value)) {
            // eslint-disable-next-line no-loop-func
            value.forEach((item) => {
                result.push(`${currentKey} > ${item}`);
            });
        } else if (typeof value === "object" && value !== null) {
            const subResult = transformObject(value, currentKey);
            result = result.concat(subResult);
        }
    }

    return result;
};
export const uploader = Uploader({
    apiKey: "public_kW15bf94Uuq6JoVpKAARbeYqBZPb" // Get production API keys from Bytescale
});
export function getValueColor(value) {
    // Normalize the value to a range between 0 and 1
    const normalizedValue = (value - 0) / (60 - 0);

    // Calculate the hue value for the color gradient
    const hue = (1 - normalizedValue) * 120;

    // Convert HSL to RGB
    const hslToRgb = (h, s, l) => {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hueToRgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hueToRgb(p, q, h + 1 / 3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    // Convert RGB to hexadecimal color code
    const rgbToHex = (r, g, b) => {
        return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
    };

    // Calculate the RGB values
    const [r, g, b] = hslToRgb(hue, 100, 50);

    // Convert RGB to hexadecimal color code
    const color = rgbToHex(r, g, b);

    return color;
}

