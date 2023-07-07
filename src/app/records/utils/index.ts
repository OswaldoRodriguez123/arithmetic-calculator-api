import axios from "axios";

export const operation_generator = (() => {

  const add = (num: number = 0, num2: number = 0) => num + num2;

  const subtract = (num: number = 0, num2: number = 0) => num - num2;

  const multiply = (num: number = 0, num2: number = 0) => num * num2;

  const divide = (num: number = 0, num2: number = 0) => num / num2;

  const square_root = (num: number = 0) => num * num;

  const random_string_generator = async() => {
    try {
      const response = await axios.get('https://www.random.org/strings/?num=1&len=8&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new')
      return response.data.trim();
    } catch (err) {
      console.error(err);
      return '';
    }
  };

  return {
    add,
    subtract,
    multiply,
    divide,
    square_root,
    random_string_generator
  };
})();