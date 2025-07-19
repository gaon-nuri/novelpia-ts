function get_random_int(min: number, max: number): number {
    min = min || 0; // 최소 0
    max = max || 1;
    const rnd = Math.random();

    return min + Math.ceil(rnd * (max - min));
}

export {
    get_random_int
}