export default function (min, max) {
    // min = !min ? 10000 : min;
    // max = !max ? 20000 : max;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}