/* ************************* Promise Function ************************* */
function Promise(processor) {
  var self = this;
  self.status = 'pending';  // status
  self.value = null;  // resolve value
  self.reason = null;  // reject reason
  self.onRejectedCallbacks = [];  // reject callback
  self.onResolvedCallbacks = [];  // resolve callback

  // resolve //
  function resolve(value) {
    if (self.status !== 'pending') return;
    
    var resolveDo = function (_value) {
      self.status = 'resolved';
      self.value = _value;
      self.onResolvedCallbacks.map(function (callback) {
        callback();
      });
    };

    analysisPromise(value, resolveDo, reject);
  }

  // reject //
  function reject(reason) {
    if (self.status !== 'pending') return;

    self.status = 'rejected';
    self.reason = reason;
    self.onRejectedCallbacks.map(function (callback) {
      callback(reason);
    });
  }

  // delay to next event loop //
  try {
    processor(resolve, reject);
  } catch (e) {
    setTimeout(function () {
      reject(e);
    });
  }
}

/* ------------------- 分析promise.then中返回的值类型 promise/value ------------------- */
/**
 * [analysisPromise 使用递归将状态控制权转移]
 * @param  {[Any]} x        [value]
 * @param  {[Func]} resolve [get into success state]
 * @param  {[Func]} reject  [get into faill state]
 */
var analysisPromise = function (x, resolve, reject) {

  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // obj Promise
    if (x.then && typeof x.then === 'function') {
      x.then(function (value) {
        // callback return a promise
        analysisPromise(value, resolve, reject);
      }, reject);
    // normal
    } else {
      resolve(x);
    }
  // normal
  } else {
    resolve(x);
  }
};

/* ------------------- then-返回新的promise ------------------- */
/**
 * [then 应该返回一个全新的Promise对象，不应该与当前Promise存在功能耦合]
 * @param  {[type]} successFn [description]
 * @param  {[type]} errorFn   [description]
 */
Promise.prototype.then = function (successCallback, errorCallback) {

  var promise, x;
  var self = this;

  if (self.status === 'resolved') {
    promise = new Promise(function (resolve, reject) {
      // delay to next event loop
      setTimeout(function () {
        try {
          x = successCallback ? successCallback(self.value) : self.value;
          analysisPromise(x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    });
  }else if (self.status === 'rejected') {
    promise = new Promise(function (resolve, reject) {
      // delay to next event loop
      setTimeout(function () {
        try {
          x = errorCallback ? errorCallback(self.reason) : Promise.reject(self.reason);
          analysisPromise(x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });

    });
  }else if (self.status === 'pending') {
    promise = new Promise(function (resolve, reject) {
      // 延迟到下一个事件循环
      self.onResolvedCallbacks.push(function () {
        try {
          x = successCallback ? successCallback(self.value) : self.value;
          // 分析返回值 然后更改 当前promise状态
          analysisPromise(x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });

      self.onRejectedCallbacks.push(function () {
        try {
          x = errorCallback ? errorCallback(self.reason) : Promise.reject(self.reason);
          // 分析返回值 然后更改 当前promise状态
          analysisPromise(x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    });

  }

  return promise;
};


/* ------------------- 错误捕获 ------------------- */
Promise.prototype.catch = function (handleError) {
  var self = this;
  var promise = new Promise(function (resolve, reject) {
    try {
      analysisPromise(self,
        function(result) {
          // resolved -> 返回原始结果
          resolve(result);
        },
        function(error) {
          // rejected -> 处理错误 -> 返回resolved结果
          handleError(error);
          resolve(error);
        });
    } catch (e) {
      // catch error -> 返回resolved结果
      resolve(e);
    }
  });

  return promise;
};


/* ------------------- all-所有promise成功后即成功,一个失败即失败 ------------------- */

Promise.all = function (pArray) {
  var rArray = [];
  var promise = new Promise(function (resolve, reject) {

    pArray.forEach(function (pr, i) {

        if (pr instanceof Promise) {
          pr.then(function (value1) {
            analysisPromise(value1, function (value2) {
              rArray[i] = value2;
              if (rArray.length === pArray.length) {
                resolve(rArray);
              }
            }, reject);

          }, function (error) {
            reject(error);
          });

        }else {
          rArray[i] = pr;
          if (rArray.length === pArray.length) {
            resolve(rArray);
          }
        }

    });

  });

  return promise;
};

/* ------------------- race - 最终状态取决于第一个完成的promise状态 ------------------- */
Promise.race = function (pArray) {
  var rArray = [];
  var promise = new Promise(function (resolve, reject) {

    pArray.forEach(function (pr, i) {
        if (pr instanceof Promise) {
          pr.then(function (value) {
            analysisPromise(value, resolve, reject);
          }, function (error) {
            reject(error);
          });
        }else {
          rArray[i] = pr;
        }
    });
  });

  return promise;
};

/* ------------------- 返回成功态的promise ------------------- */
Promise.resolve = function (value) {
  return (value instanceof Promise) ? value : new Promise(function (resolve, reject) {
      resolve(value);
  });
};

/* ------------------- 返回失败态的promise ------------------- */
Promise.reject = function (reason) {
  return (reason instanceof Promise) ? value : new Promise(function (resolve, reject) {
      reject(reason);
  });
};