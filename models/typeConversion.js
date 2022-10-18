const conversion = (whatever) => whatever=='' ? null : isNaN(parseFloat(whatever)) ? whatever : parseFloat(whatever);
const objectMap = (obj, fn) => Object.fromEntries( Object.entries(obj).map( ([k,v],i)=>[k,fn(v,k,i)] ) );
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