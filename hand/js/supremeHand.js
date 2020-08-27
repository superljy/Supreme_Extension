/*
url:https://www.supremenewyork.com/shop/all/xxx xxx表示类目
*/
//delay
console.log('Handbot forever');

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

    let params = {
        active: true,
        currentWindow: true
    }
    chrome.tabs.query(params, (tabs) => {
        // let port = chrome.tabs.connect(tabs[0].id, {
        //     name: 'popup-msg'
        // })
        // port.postMessage(message);
        // port.onMessage.addListener((msg) => {
        //     console.log(msg)
        //     addToCart();
        // })

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

let addToCart = () => {
    // chrome.tabs.query({
    //     active: true,
    //     currentWindow: true
    // }, (tabs) => {
    //     let message = {
    //         info: 'start'
    //     }
    //     chrome.tabs.sendMessage(tabs[0].id, message, (res) => {
    //         console.log('Start to add');
    //     })
    // })

    /*
        使用长链接传递到background.js
        再由background.js与content script通信    
    */
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

