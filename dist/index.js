import { binarize } from "./binarizer";
import { decode } from "./decoder/decoder";
import { extract } from "./extractor";
import { locate } from "./locator";
function scan(matrix) {
    const location = locate(matrix);
    if (!location) {
        return null;
    }
    const extracted = extract(matrix, location);
    const decoded = decode(extracted.matrix);
    if (!decoded) {
        return null;
    }
    return {
        binaryData: decoded.bytes,
        data: decoded.text,
        chunks: decoded.chunks,
        location: {
            topRightCorner: extracted.mappingFunction(location.dimension, 0),
            topLeftCorner: extracted.mappingFunction(0, 0),
            bottomRightCorner: extracted.mappingFunction(location.dimension, location.dimension),
            bottomLeftCorner: extracted.mappingFunction(0, location.dimension),
            topRightFinderPattern: location.topRight,
            topLeftFinderPattern: location.topLeft,
            bottomLeftFinderPattern: location.bottomLeft,
            bottomRightAlignmentPattern: location.alignmentPattern,
        },
    };
}
const defaultOptions = {
    inversionAttempts: "attemptBoth",
};
function jsQR(data, width, height, providedOptions = {}) {
    const options = defaultOptions;
    Object.keys(options || {}).forEach(opt => {
        options[opt] = providedOptions[opt] || options[opt];
    });
    const shouldInvert = options.inversionAttempts === "attemptBoth" || options.inversionAttempts === "invertFirst";
    const tryInvertedFirst = options.inversionAttempts === "onlyInvert" || options.inversionAttempts === "invertFirst";
    const { binarized, inverted } = binarize(data, width, height, shouldInvert);
    let result = scan(tryInvertedFirst ? inverted : binarized);
    if (!result && (options.inversionAttempts === "attemptBoth" || options.inversionAttempts === "invertFirst")) {
        result = scan(tryInvertedFirst ? binarized : inverted);
    }
    return result;
}
jsQR.default = jsQR;
export default jsQR;
