(function(window){
    const PENDING = 'pending';
    const RESOLVED = 'resolved';
    const REJECTED = 'rejected';

    class Promise {

        static resolve(value) {
            return new Promise((resolve, reject) => {
                if (value instanceof Promise) {
                    value.then(resolve, reject);
                } else {
                    resolve(value);
                }
            })
        }

        static reject(reason) {
            return new Promise((resolve, reject) => {
                reject(reason);
            })
        }

        static all(collection) {
            return new Promise((resolve, reject) => {
                const arr = [];
                let flag = false;
                collection.forEach((p, index) => {
                    p.then(res => {
                        arr[index] = res;
                    }, rea => {
                        reject(rea);
                        flag = true;
                    })
                    if (flag) return;

                    if (index === collection.length - 1) {
                        resolve(arr);
                    }
                })
            })
        }

        static race(collection) {
            return new Promise((resolve, reject) => {
                for (let p of collection) {
                    p.then(res => {
                        resolve(res);
                    }, rea => {
                        reject(rea);
                    })
                }
            });
        }

        constructor(excutor) {
            this.status = PENDING;
            this.value = null;

            this.callback = {
                resolved: [],
                rejected: []
            }
            const resolve = (value) => {
                if (this.status !== PENDING) return;
                this.value = value;
                this.status = RESOLVED;
                this.callback.resolved.forEach((res) => {
                    res(this.value);
                });
            }
            const reject = (reason) => {
                if (this.status !== PENDING) return;
                this.status = REJECTED;
                this.value = reason;
                this.callback.rejected.forEach((rej) => {
                    rej(this.value);
                })
            }

            try {
                excutor && excutor(resolve, reject);
            } catch(e) {
                reject(e.message);
            }
        }

        then(resolvedCallback, rejectedCallback) {

            rejectedCallback = typeof rejectedCallback === 'function' ? rejectedCallback
                : reason => Promise.reject(reason);
            // 回调函数执行根据状态
            const p = new Promise((resolve, reject) => {
                if (this.status === RESOLVED) {
                    // setTimeout(() => {
                    //     try {
                    //         const result = resolvedCallback(this.value);
                    //         if (result instanceof Promise) {
                    //             result.then(resolve, reject);
                    //         }else {

                    //             resolve(result);
                    //         }
                    //     } catch(e) {
                    //         reject(e.message);
                    //     }
                    // })
                    this.repeatDes(resolvedCallback, resolve, reject, this.value);
                    
                } else if (this.status === REJECTED) {
                    // setTimeout(() => {
                    //     try {
                    //         const result = rejectedCallback(this.value);
                    //         resolve(result);
                    //     } catch(e) {
                    //         reject(e.message);
                    //     }
                    // })
                    this.repeatDes(rejectedCallback, resolve, reject, this.value);
                } else {
                    this.callback.resolved.push((value) => {
                        this.repeatDes(resolvedCallback, resolve, reject, value);
                    })
                    this.callback.rejected.push((value) => {
                        this.repeatDes(rejectedCallback, resolve, reject, value);
                    })
                }
            })


           return p;
        }

        catch(onRejected) {
            if (this.status === REJECTED) {
                onRejected && onRejected(this.value);
            }
        }

        

        repeatDes(callback,resolve, reject, value) {
            try {
                const result = callback(value);
                if (result instanceof Promise) {
                    result.then(resolve, reject);
                    
                } else {
                    resolve(result);
                }
                
            } catch(e) {
                reject(e.message);
            }
        }


    }





    window.Promise = Promise;
})(window)