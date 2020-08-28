/*
    popup端与content端进行两次通信 (主要因为第一次通信后会发生页面跳转,一次通信无法进行跳转后的操作,所以需要使用第二次通信保证接下来的操作生效)
    第一次,把在popup端输入的数据传递过去content端,并保存在页面缓存中,页面跳转到相关的类目
    第二次,content页面跳转后,popup端再次发起通信,进行加车操作,读取的是第一次连接时缓存在页面本地的数据
*/
console.log('Popup');

//获取存储在chrome.storage的数据
chrome.storage.sync.get({
    category: null,
    keyword: null,
    color: null,
    size: null,
    delay: null
}, (result) => {
    console.log(result)
    document.querySelector('#category').value = result.category;
    document.querySelector('#keyword-input').value = result.keyword;
    document.querySelector('#color-input').value = result.color;
    document.querySelector('#size-input').value = result.size;
    document.querySelector('#delay-input').value = result.delay;

});

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

    chrome.storage.sync.set(message, () => {
        console.log('Save')
    });

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