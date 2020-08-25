let firstUpperCase = ([first, ...rest]) => {
    return first.toUpperCase() + rest.join('');
}

let str = 'tagless';

console.log(firstUpperCase(str));