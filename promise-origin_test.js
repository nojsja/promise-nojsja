const promise3 = new Promise((resolve, reject) => {
  setTimeout(() => reject('promise3 -> reject'), 1000);
});
const promise4 = new Promise((resolve, reject) => {
  resolve(promise3);
});
 promise4.then((value) => {
   console.log(`promise4 resolve promise3 success value: ${value}`);
 }, (value2) => {
   console.log(`promise4 resolve promise3 failed value: ${value2}`);
 });
