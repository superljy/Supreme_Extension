console.log('Content_Script');

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
        selectProduct(productArr, colorArr, customInfo);

        //进入商品后获取尺码选项 选中尺码并加车
        await delay(parseInt(customInfo.delay));

        let productSizeSelectArr = document.querySelectorAll('select#s option');

        // if (soldOut) {
        //     console.log('Product Sold-out');
        //     location.reload();
        //     addToCart();
        // } else {
        //     selectSize(productSizeSelectArr, customInfo);
        // }
        selectSize(productSizeSelectArr, customInfo);

        //加车后点击进入结账页面
        await delay(parseInt(customInfo.delay));
        document.querySelector('#cart a.checkout').click();
    }

}

let selectProduct = (productArr, colorArr, customInfo) => {
    for (let i = 0; i < productArr.length; i++) {
        if (productArr[i].innerHTML.indexOf(customInfo.keyword) !== -1 && colorArr[i].innerHTML.indexOf(customInfo.color) !== -1) {
            productArr[i].click();
            break;
        }
    }
}

let selectSize = (sizeArr, customInfo) => {
    let soldOut = document.querySelector('#add-remove-buttons b.sold-out');
    if (soldOut) {
        alert('Product Sold-out,please retry..');
    }
    for (let i = 0; i < sizeArr.length; i++) {
        if (sizeArr[i].innerHTML.indexOf(customInfo.size) !== -1) {
            sizeArr[i].selected = true;
            break;
        }
    }
    document.querySelector('#add-remove-buttons input').click();
}