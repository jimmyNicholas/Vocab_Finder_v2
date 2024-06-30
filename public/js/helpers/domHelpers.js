const addHideClass = (element) => {
    element.classList.add('hide');
};

const removeHideClass = (element) => {
    element.classList.remove('hide');
}

const getTemplate = (templateName) => {
    const temp = document.querySelector(templateName);
    return temp.content.cloneNode(true);
  };

export {
    addHideClass,
    removeHideClass,
    getTemplate,
}