console.log('Hand Bot Forever');

//延迟
let delay = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    })
}

/*
    短连接
    接收第一次popup端发送过来的用户输入信息,并在本地缓存起来,方便页面跳转后再次使用同样的信息
    写入缓存并控制跳转 发送response到popup端告知第一步已完成
*/
chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
    console.log(res);
    window.localStorage.setItem('customInfo', JSON.stringify(res));
    window.sessionStorage.setItem('customInfo', JSON.stringify(res));

    sendResponse(`即将跳转,原链接:${location.href}`);
    let baseUrl = 'https://www.supremenewyork.com/shop/all/';
    location.href = baseUrl + res.category;
})

/*
    长连接
    第二次发起的连接,处理因页面发生跳转后数据清空无法只用一次连接完成的剩余部分内容
*/
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'supreme') {
        port.onMessage.addListener(async (res) => {
            console.log(res);
            await delay(1000);
            addToCart();
        })
    }
})

let addToCart = async () => {
    let customInfo = JSON.parse(window.localStorage.customInfo);
    if (location.href === 'https://www.supremenewyork.com/shop/all/' + customInfo.category) {
        //获取商品和颜色
        let productArr = document.querySelectorAll('.product-name .name-link');
        let colorArr = document.querySelectorAll('.product-style .name-link');
        
        for (let i = 0; i < productArr.length; i++) {
            if (productArr[i].innerHTML.indexOf(customInfo.keyword) !== -1 && colorArr[i].innerHTML.indexOf(customInfo.color) !== -1) {
                productArr[i].click();
                break;
            }
        }
        //进入商品后获取尺码选项 选中尺码并加车
        await delay(customInfo.delay);
        let productSizeSelectArr = document.querySelectorAll('select#s option');
        for (let i = 0; i < productSizeSelectArr.length; i++) {
            if (productSizeSelectArr[i].innerHTML.indexOf(customInfo.size) !== -1) {
                productSizeSelectArr[i].selected = true;
                break;
            }
        }
        document.querySelector('#add-remove-buttons input').click();
        //加车后点击进入结账页面
        await delay(customInfo.delay);
        document.querySelector('#cart a.checkout').click();
    }
}
