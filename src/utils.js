/**
 * Creates a new DOM element with the supplied attributes.
 * @param {String} type The type of element to create. E.g. 'div', 'input'..
 * @param {Object} attributes An object with the attrbutes to attach to the element.
 * @return {!HTMLElement} A new DOM element with the supplied attributes.
 */
function createElement(type, attributes) {
    const element = document.createElement(type);
    if (!attributes) { return element; }

    const properties = Object.keys(attributes);

    for (let i = 0; i < properties.length; i += 1) {
        element.setAttribute(properties[i], attributes[properties[i]]);
    }

    return element;
}


/**
 * Removes all the children attached to the element.
 * @param {HTMLElement} element The element whose children will be removed.
 * @return {!HTMLElement} The original element with its children removed.
 */
function clearChildren(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
    return element;
}

/**
 * Gets the attributes of an element as an  object.
 * @param {Element} element The element whose attributes to get.
 * @return {!Object} An object whose keys are the attribute keys and whose
 *     values are the attribute values. If no attributes exist, an empty
 *     object is returned.
 */
function getAttributes(element) {
    const attrs = {};

    // Validate input. nodeType 1 is Node.ELEMENT_NODE.
    if (!(element && element.nodeType === 1)) return attrs;

    // Return an empty object if there are no attributes.
    const map = element.attributes;
    if (map.length === 0) return {};

    for (let i = 0; i < map.length; i += 1) {
        const attribute = map[i];
        attrs[attribute.name] = attribute.value;
    }
    return attrs;
}


/**
 * Capitalize the first letter of the string.
 * @param {String} string The element whose attributes to get.
 * @return {!String} A new string with the first letter capitalized.
 */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


/**
 * Takes an element and removes all instances of a class from the element
 * and all of its children.
 * @param {HTMLElement} parent The parent and its children who will have class removed.
 * @param {String} classToRemove The class which will be removed. No '.' should be used.
 * @return {!HTMLElement} The original parent, now with the specified class removed.
 */
function clearClass(parent, classToRemove) {
    const elements = parent.getElementsByClassName(classToRemove);

    for (let i = 0; i < elements.length; i += 1) {
        const element = elements[i];
        element.classList.remove(classToRemove);
    }

    return parent;
}


/**
 * Takes an URL, creates a GET requests and returns the data in a callback.
 * It is possible to include context with request.
 * @param {String} url The URL which will be requested.
 * @param {Function} callback The function which will be called when the request is completed.
 * The callback will have for format (false, response, context) if succeeeded.
 * The callback will have the format (true, error, context) if failed.
 * @param {Any} context A context which will be return when the call is completed.
 * @return {!HTMLElement} The XMLHttpRequest, with all its prototypes. Meaning that it is abortable.
 */
function get(url, callback, context) {
    const req = new XMLHttpRequest();

    req.onreadystatechange = function onreadystatechange() {
        if (this.readyState === 4 && this.status === 200) {
            callback(false, this.responseText, context);
        }
    };

    req.onerror = function onerror(err) { callback(true, err, context); };
    req.onabort = function onabort(msg) { callback(true, msg, context); };
    req.open('GET', url, true);
    req.send();

    return req;
}

function createGeojsonPoint(properties, coordinates) {
    return {
        type: 'Feature',
        properties,
        geometry: {
            type: 'Point',
            coordinates,
        },
    };
}

export {
    createElement,
    clearChildren,
    capitalize,
    clearClass,
    getAttributes,
    get,
    createGeojsonPoint,
};
