// Because, the form returns strings only, this module converts empty values to null, and string-numbers to actual numbers. 

/** Converts empty or "null" values to null and string-numbers to actual numbers */
const conversion = (whatever) => (whatever=='' || whatever=="null") ? null : isNaN(parseFloat(whatever)) ? whatever : parseFloat(whatever);

/** Like map, but for objects */
const objectMap = (obj, fn) => Object.fromEntries( Object.entries(obj).map( ([k,v],i)=>[k,fn(v,k,i)] ) );

/** Clears an Object, returning the correct types */
const clearObject = (obj) => objectMap(obj,x=>conversion(x));


module.exports = {clearObject}


/*
let testObject = {
    a: "5",
    b: "12",
    c:"hello"
}

console.log(objectMap(testObject,x=>x+1));
console.log(objectMap(testObject,x=>tryToConvertToNumber(x)));
console.log(clearObject(testObject));


console.log(convertToNumberIfNumber("hello"));
console.log(convertToNumberIfNumber("true"));
console.log(convertToNumberIfNumber("3"));
console.log(convertToNumberIfNumber(3));


/*


console.log(convert(5,"string"))
console.log(convert("5","number"))
console.log(convert("5,26","number"))
console.log(convert("5.26","number"))
console.log(convert(1,"boolean"))
console.log(convert("5","boolean"))
console.log(convert("1","boolean"))
console.log(convert(null,"boolean"))
console.log(convert(undefined,"boolean"))
console.log(convert("true","boolean"))


*/