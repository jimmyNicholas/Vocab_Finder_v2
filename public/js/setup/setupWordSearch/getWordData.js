const getWordData = async (wordString) => {
    const url = `/getWordData/${wordString}`;
    const options = {
        method: 'GET',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
        },
    };
  
    try {
        const wordData = await fetch(url, options);
        return wordData.json();
    } catch (error) {
        console.error(error);
    }
  };

  export {
    getWordData,
  }