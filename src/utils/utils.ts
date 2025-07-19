function partialApply(
    fn: Function,
    ...args: any[]
): ReturnType<typeof Function> {
    return fn.bind(null, ...args);
}

function getRandInt(min: number, max: number): number {
    min = min || 0; // 최소 0
    max = max || 1;
    const rnd = Math.random();

    return min + Math.ceil(rnd * (max - min));
}

export {
    partialApply,
    getRandInt
}