const ensureArray = (value) => {
    return Array.isArray(value) ? value : [value];
};

export {
    ensureArray,
}