/*
    popup端与content端进行两次通信 (主要因为第一次通信后会发生页面跳转,一次通信无法进行跳转后的操作,所以需要使用第二次通信保证接下来的操作生效)
    第一次,把在popup端输入的数据传递过去content端,并保存在页面缓存中,页面跳转到相关的类目
    第二次,content页面跳转后,popup端再次发起通信,进行加车操作,读取的是第一次连接时缓存在页面本地的数据
*/

window.onload = () => {
    console.log('Popup');

    //选项卡
    let tabs = document.querySelectorAll('.tab li');
    let contents = document.querySelectorAll('.content li');
    document.querySelector('.tab').addEventListener('click', (e) => {
        let index = 0;
        for (let i = 0; i < tabs.length; i++) {
            if (e.target === tabs[i]) {
                index = i;
            }
        }
        tabs[index].classList.add('tab-active');
        contents[index].classList.add('content-active');
        for (tab of tabs) {
            if (tab !== tabs[index]) {
                tab.classList.remove('tab-active');
            }
        }
        for (content of contents) {
            if (content !== contents[index]) {
                content.classList.remove('content-active');
            }
        }

    }, true);

    let inputInfos = document.querySelectorAll('.content input');
    for (info of inputInfos) {
        info.addEventListener('blur', () => {
            chromeStorage();
        })
    };

    //获取存储在chrome.storage的数据
    chrome.storage.sync.get({
        category: null,
        keyword: null,
        color: null,
        size: null,
        delay: null,
        fullname: null,
        email: null,
        telephone: null,
        address: null,
        address2: null,
        zip: null,
        city: null,
        state: null,
        country: null,
        number: null,
        month: null,
        year: null,
        cvv: null,
        webhook: null
    }, (result) => {
        console.log(result)
        document.querySelector('#category').value = result.category;
        document.querySelector('#keyword-input').value = result.keyword;
        document.querySelector('#color-input').value = result.color;
        document.querySelector('#size-input').value = result.size;
        document.querySelector('#delay-input').value = result.delay;
        document.querySelector('#fullname').value = result.fullname;
        document.querySelector('#email').value = result.email;
        document.querySelector('#telephone').value = result.telephone;
        document.querySelector('#address').value = result.address;
        document.querySelector('#address2').value = result.address2;
        document.querySelector('#zip').value = result.zip;
        document.querySelector('#city').value = result.city;
        document.querySelector('#state').value = result.state;
        document.querySelector('#country').value = result.country;
        document.querySelector('#number').value = result.number;
        document.querySelector('#month').value = result.month;
        document.querySelector('#year').value = result.year;
        document.querySelector('#cvv').value = result.cvv;
        document.querySelector('#webhook').value = result.webhook;
    });

    //设定好关键字等抢购信息后点击开始运行
    document.querySelector('#start-btn').addEventListener('click', () => {
        console.log('Clicked start button');
        getCustomInfo();
    }, true);

    //
}


//首字母大写
let firstUpperCase = ([first, ...rest]) => {
    return first.toUpperCase() + rest.join('');
}

let getCustomInfo = () => {
    //获取类目,关键字,尺码,延迟时间
    let message = {
        category: document.querySelector('#category').value,
        keyword: firstUpperCase(document.querySelector('#keyword-input').value),
        color: document.querySelector('#color-input').value,
        size: firstUpperCase(document.querySelector('#size-input').value),
        delay: document.querySelector('#delay-input').value,
        msgSymbol: 'redirect to category'
    }

    /* 
        使用短连接进行,把输入的数据传递过去,透过不同的message信息识别不同的通信链接,如这里的msgSymbol
        第一次的通信把输入的keyword等信息传递到content端并根据输入的分类跳转到对应的类目商品中
        收到content端回应后执行后续加车操作
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
    第二次短连接,传递不同的msgSymbol识别不同的通信
    第二次的通信是要告诉content端进行搜索商品和加入购物车的操作
*/
let addToCart = () => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            msgSymbol: 'search and add'
        }, (res) => {
            console.log(res);
            checkout();
        })
    })
}

/**
 * 第三次短连接,传递billing和card的结账信息
 * 第三次的通信是成功加车后,进入到结账页面,自动填充用户信息输入并结账的流程
 */
let checkout = () => {
    let checkoutInfo = {
        fullname: document.querySelector('#fullname').value,
        email: document.querySelector('#email').value,
        telephone: document.querySelector('#telephone').value,
        address: document.querySelector('#address').value,
        address2: document.querySelector('#address2').value,
        zip: document.querySelector('#zip').value,
        city: document.querySelector('#city').value,
        state: document.querySelector('#state').value,
        country: document.querySelector('#country').value,
        number: document.querySelector('#number').value,
        month: document.querySelector('#month').value,
        year: document.querySelector('#year').value,
        cvv: document.querySelector('#cvv').value,
        msgSymbol: 'go checkout'
    }
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, checkoutInfo, (res) => {
            console.log(res);
        })
    })
}

chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
    if (res.msg === 'checkout') {
        checkout();
        sendResponse('checkout done');
    }
})


//获取billing card等基础信息 并储存到chrome.storage里
let chromeStorage = () => {
    //color 判断color是否多个单词组成 并转换首字母大写
    let color = document.querySelector('#color-input').value;
    if (color.indexOf(' ') !== -1) {
        let colorArr = color.split(' ');
        let upperColor = [];
        for (c of colorArr) {
            upperColor.push(firstUpperCase(c));
        }
        color = upperColor.join(' ');
    } else {
        color = firstUpperCase(color);
    }
    let storageInfo = {
        category: document.querySelector('#category').value,
        keyword: firstUpperCase(document.querySelector('#keyword-input').value),
        color: color,
        size: firstUpperCase(document.querySelector('#size-input').value),
        delay: document.querySelector('#delay-input').value,
        fullname: document.querySelector('#fullname').value,
        email: document.querySelector('#email').value,
        telephone: document.querySelector('#telephone').value,
        address: document.querySelector('#address').value,
        address2: document.querySelector('#address2').value,
        zip: document.querySelector('#zip').value,
        city: document.querySelector('#city').value,
        state: document.querySelector('#state').value,
        country: document.querySelector('#country').value,
        number: document.querySelector('#number').value,
        month: document.querySelector('#month').value,
        year: document.querySelector('#year').value,
        cvv: document.querySelector('#cvv').value,
        webhook: document.querySelector('#webhook').value
    }
    chrome.storage.sync.set(storageInfo, () => {
        console.log('Save base infomation.')
    });
}