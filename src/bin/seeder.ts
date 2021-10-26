#!/usr/bin

const [, , command] = process.argv;

console.table(command);
const allowedCommand = ["run", "h"];

const main = () => {
  if (allowedCommand.indexOf(command.toLowerCase()) === -1) {
    console.log("Oops! Only run and h commands are supported.");
    return 0;
  }

  return 1;
};

main();
