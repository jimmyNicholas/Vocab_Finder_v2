const addHideClass = (element) => {
    element.classList.add('hide');
};
  
const removeHideClass = (element) => {
    element.classList.remove('hide');
}

export {
    addHideClass,
    removeHideClass,
}