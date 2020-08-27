/*
    popup端
    与content端进行通信
*/
console.log('Popup');

//首字母大写
let firstUpperCase = ([first, ...rest]) => {
    return first.toUpperCase() + rest.join('');
}

let getCustomInfo = () => {
    //获取类目,关键字,尺码,延迟时间
    let message = {
        category: document.querySelector('#category').value,
        keyword: firstUpperCase(document.querySelector('#keyword-input').value),
        color: firstUpperCase(document.querySelector('#color-input').value),
        size: firstUpperCase(document.querySelector('#size-input').value),
        delay: document.querySelector('#delay-input').value
    }

    chrome.storage.sync.set(message, () => { console.log('Save') });

    /* 
        使用短连接进行第一次通信,把输入的数据传递过去
        当接收到content_script返回的信息后,进行下一步addToCart的操作
    */
    let params = {
        active: true,
        currentWindow: true
    }
    chrome.tabs.query(params, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message, (res) => {
            if (res) {
                console.log(res);
                setTimeout(() => {
                    addToCart();
                }, 1000);
            }
        });
    })
}

/*
    使用长链接通信 避免发起两次短连接造成重复
    使用两次短连接会导致接收端错误接收信息 如本项目中第一次传递过去的数据会被第二次的覆盖
*/
let addToCart = () => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        let port = chrome.tabs.connect(tabs[0].id, {
            name: 'supreme'
        })
        port.postMessage('start');
        port.onMessage.addListener((msg) => {
            console.log(msg);
        })
    })

}

document.querySelector('#start-btn').addEventListener('click', () => {
    console.log('Clicked start button');
    getCustomInfo();
}, true);

