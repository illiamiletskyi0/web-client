// Task 1
let a = 5;
let b = 10;

console.log(
    `${a} + ${b} = ${a + b}\n`,
    `\r${a} * ${b} = ${a * b}\n`,
    `\r${a} - ${b} = ${a - b}\n`,
    `\r${a} / ${b} = ${a / b}`
);

// Task 2
let firstName = "Іван";
let lastName = "Іванов";

let fullName = `${firstName} ${lastName}`;
console.log(`Привіт, ${fullName}!`);


// Task 3
let age = 25;

if (age >= 18) {
    console.log("Доступ дозволено");
} else {
    console.log("Доступ заборонено");
}

// Task 4
for(let i = 1; i <= 10; i++) {
    console.log(i);
}

// Task 5
function square(number) {
    return number * number;
}

console.log(`square(5) = ${square(5)}`);

// Task 6
let fruits = ["яблуко", "банан", "апельсин"];
fruits.push("груша");
console.log(fruits);
