/**
 * Generates random id based on all on an array of objects.
 * If the id already exists, it will generate a new one.
 * @param {*} allGames 
 * @returns {String} id 
 */
export const generateId = (array) => {
    let id = Math.round(Math.random() * 100000000)
    while (array.find(element => element.id === id) !== undefined) {
        id = Math.round(Math.random() * 100000000)
    }
    return id;
}

/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs

 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export const fileToDataUrl = (file) => {
    const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
    const valid = validFileTypes.find(type => type === file.type);

    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }

    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve, reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

/**
 * Wrapper func - reads a json obj file and returns the parsed object
 * @param {Object} jsonFile - json file object 
 * @returns {Promise<Object>} - parsed json object for file
 */
export const returnJsonObj = (jsonFile) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                resolve(parsed); 
            } catch (error) {
                reject(new Error(error.message));
            }
        };
        
        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };
        
        reader.readAsText(jsonFile);
    });
}

/**
 * Session helper func to calculate the duration of a question
 * @param {Date} start - start time of the question
 * @param {Date} end - end time of the question
 * @returns 
 */
export const calcDuration = (start, end) => {
    if (!start || !end) {
        return "—";
    }
    const duration = (new Date(end) - new Date(start)) / 1000;
    return duration;
};