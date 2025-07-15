function partialApply(
    fn: Function,
    ...args: any[]
): ReturnType<typeof Function> {
    return fn.bind(null, ...args);
}

export {
    partialApply
}