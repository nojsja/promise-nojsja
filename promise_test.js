/* ------------------- 功能测试 ------------------- */
var promise1 = new Promise(function (resolve, reject) {
  console.log('Promise1 -> pending');
  setTimeout(function () {
    resolve('Promise1 -> resolved');
    // reject('promise1 -> rejected');
  }, 1000);
});
promise1.then(function (value) {
  console.log(value);
}, function (reason) {
  console.log(reason);
});
promise1.then(function (value) {
  var promise = new Promise(function (resolve, reject) {
    console.log('Promise1.then => new Promise');
    setTimeout(function () {
      resolve('Promise1 then => new Promise => resolve');
    }, 1000)
  });
  promise.then(function (value) {
    console.log(value);
  })
  return promise;
}).then(function (value) {
  return new Promise(function (resolve, reject) {
  });
});

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


/* ------------------- 错误处理测试 ------------------- */
var promise2 = new Promise(function (resolve, reject) {
  // throw new Error('promise2 error test.');
  resolve(true);
});

promise2.then(function (value) {
  throw new Error('Error Test');
}, function (reason) {
  console.log('Promise2 then error: ', reason);
}).catch(function (error) {
  console.log('Promise2 then throw error: ', error);
});

promise2.catch(function (error) {
  console.log('Promise2 catch error: ', error);
});


/* ------------------- all函数测试 ------------------- */
Promise.all([

  new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(true);
    }, 1000);
  }),

  new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(false);
    }, 2000);
  }),

  new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(true);
    }, 2000);
  }),

]).then(function (value) {
  console.log('Promise.all - value: ', value);
}, function (reason) {
  console.log('Promise.all - reason: ', reason);
});


/* ------------------- race函数测试 ------------------- */
Promise.race(
  [
    new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve('race1');
      }, 2000);
    }),

    new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve('race2');
      }, 3000);
    }),

    new Promise(function (resolve, reject) {
      setTimeout(function () {
        reject('race3');
      }, 1000);
    }),
  ]
).then(function (value) {
  console.log('Promise.race - value : ', value);
}, function (reason) {
  console.log('Promise.race - reason : ', reason);
})


/* ------------------- resolve/reject静态方法测试 ------------------- */
Promise.resolve('static_resolve').then(function (value) {
  console.log('Promise.resolve: ', value);
}, function (reason) {
  console.log('Promise.reject: ', reason);
});

Promise.reject('static_reject').then(function (value) {
  console.log('Promise.resolve: ', value);
}, function (reason) {
  console.log('Promise.reject: ', reason);
});
