function greet(){
    console.log("Hello");
}

function greet2(name){
    console.log("Hello," + name);
}

function sum(a, b){
    return a + b;
}

greet(); //вызов функции
greet2("Alex");
greet2("Anna");


let s = sum(2,3);
console.log(s);