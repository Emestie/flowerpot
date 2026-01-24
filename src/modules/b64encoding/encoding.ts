function base64ToBytes(base64: string) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (char) => char.charCodeAt(0));
}

function bytesToBase64(bytes: any) {
    const binString = String.fromCharCode(...bytes);
    return btoa(binString);
}

function isWellFormed(str: string) {
    try {
        encodeURIComponent(str);
        return true;
    } catch {
        return false;
    }
}

export function b64Encode(input: string) {
    if (isWellFormed(input)) {
        const utf8Encoder = new TextEncoder();

        const encoded = bytesToBase64(utf8Encoder.encode(input));
        return encoded;
    } else {
        throw new Error("Invalid string with lone surrogates.");
    }
}

export function b64Decode(input: string) {
    if (isWellFormed(input)) {
        const utf8Decoder = new TextDecoder();

        const decoded = utf8Decoder.decode(base64ToBytes(input));
        return decoded;
    } else {
        throw new Error("Invalid string with lone surrogates.");
    }
}
