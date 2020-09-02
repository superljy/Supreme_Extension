/**
 * Created by August@2020.8
 * Content_Script
 * 
 */

console.log('Content_Script');

//延迟
const delay = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    })
}

//首字母大写
const firstUpperCase = ([first, ...rest]) => {
    return first.toUpperCase() + rest.join('');
}

/*
    第一次短连接
    接收第一次popup端发送过来的用户输入信息,并在本地缓存起来,方便页面跳转后再次使用同样的信息
    写入缓存并控制跳转 发送response到popup端告知第一步已完成
*/
chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
    if (res.msgSymbol === 'redirect to category') {
        window.localStorage.setItem('customInfo', JSON.stringify(res));
        window.sessionStorage.setItem('customInfo', JSON.stringify(res));

        sendResponse(`redirect done`);
        let baseUrl = 'https://www.supremenewyork.com/shop/all/';
        location.href = baseUrl + res.category;
    }
})

/*
    第二次短连接
    第二次发起的连接,判断msgSymbol,进行商品搜索和加车操作
*/
chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
    if (res.msgSymbol === 'search and add') {
        addToCart();
        sendResponse('start to add');
    }
})

/**
 * 加入购物车后,判断当前页面是否到达结账页面
 * 如已到达则发信息通知popup端执行checkout的步骤
 * (content端可用的chrome api只有onMessage sendMessage这两种,直接使用runtime.sendMessage发送消息 在popup端监听即可)
 */
if (location.href === 'https://www.supremenewyork.com/checkout') {
    chrome.runtime.sendMessage({
        msg: 'checkout'
    }, (res) => {
        console.log(res);
    })
}

/**
 * 第三次短连接
 * 第三次通信是加车成功后进行结账的操作
 */
chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
    if (res.msgSymbol === 'go checkout') {
        sendResponse('try checkout');
        checkout(res);
    }
})

/**
 * 选择分类跳转后添加购物车操作
 */
const addToCart = async () => {
    let customInfo = JSON.parse(window.localStorage.customInfo);
    if (location.href === 'https://www.supremenewyork.com/shop/all/' + customInfo.category) {
        //获取商品和颜色
        let productArr = document.querySelectorAll('.product-name .name-link');
        let colorArr = document.querySelectorAll('.product-style .name-link');
        selectProduct(productArr, colorArr, customInfo);

        //进入商品后获取尺码选项 选中尺码并加车
        await delay(parseInt(customInfo.delay));
        let productSizeSelectArr = document.querySelectorAll('select#s option');
        selectSize(productSizeSelectArr, customInfo);

        //加车后点击进入结账页面
        await delay(parseInt(customInfo.delay));
        document.querySelector('#cart a.checkout').click();

    }
}

/**
 * 判断关键字与颜色 选择商品方法
 * @param {页面中所有商品标题的数组} productArr 
 * @param {对应商品颜色的数组} colorArr 
 * @param {自定义关键字 颜色 尺码信息} customInfo 
 */
const selectProduct = (productArr, colorArr, customInfo) => {
    if (customInfo.color.toLowerCase() === 'random') {
        let newProduct = [];
        for (let i = 0; i < productArr.length; i++) {
            if (productArr[i].innerHTML.indexOf(firstUpperCase(customInfo.keyword)) !== -1) {
                newProduct.push(productArr[i]);
            }
        }
        let productIndex = getRandom(0, newProduct.length - 1);
        newProduct[productIndex].click();
    } else {
        for (let i = 0; i < productArr.length; i++) {
            if (productArr[i].innerHTML.indexOf(firstUpperCase(customInfo.keyword)) !== -1 && colorArr[i].innerHTML.indexOf(firstUpperCase(customInfo.color)) !== -1) {
                productArr[i].click();
                break;
            }
            // else {
            //     alert('Could not found out your product,please confirm your custom setting for the product');
            //     location.href = 'https://www.supremenewyork.com/shop/';
            // }
        }
    }
}

/**
 * 判断尺码并进行加车方法 中间会判断商品是否已售罄
 * @param {尺码数组} sizeArr 
 * @param {自定义关键字 颜色 尺码信息} customInfo 
 */
const selectSize = (sizeArr, customInfo) => {
    let soldOut = document.querySelector('#add-remove-buttons b.sold-out');
    if (soldOut) {
        alert('Product Sold-out,please retry or change product..');
    } else {
        const sizes = ['Small', 'Medium', 'Large', 'XLarge'];
        if (customInfo.size.toLowerCase() === 'random') {
            let sizeIndex = getRandom(0, 3);
            customInfo.size = sizes[sizeIndex];
        }
        for (let i = 0; i < sizeArr.length; i++) {
            if (sizeArr[i].innerHTML.indexOf(firstUpperCase(customInfo.size)) !== -1) {
                sizeArr[i].selected = true;
                break;
            }
        }
        document.querySelector('#add-remove-buttons input').click();
    }

}

//结账方法
const checkout = (checkoutInfo) => {
    console.log(checkoutInfo);
    document.querySelector('#order_billing_name').value = checkoutInfo.fullname;
    document.querySelector('#order_email').value = checkoutInfo.email;
    document.querySelector('#order_tel').value = checkoutInfo.telephone;
    document.querySelector('#bo').value = checkoutInfo.address;
    document.querySelector('#oba3').value = checkoutInfo.address2;
    document.querySelector('#order_billing_zip').value = checkoutInfo.zip;
    document.querySelector('#order_billing_city').value = checkoutInfo.city;
    document.querySelector('#order_billing_state').value = checkoutInfo.state;
    document.querySelector('#order_billing_country').value = checkoutInfo.country;
    document.querySelector('#credit_card_type').value = 'credit card';
    document.querySelector('#rnsnckrn').value = checkoutInfo.number;
    document.querySelector('#credit_card_month').value = checkoutInfo.month;
    document.querySelector('#credit_card_year').value = checkoutInfo.year;
    document.querySelector('#orcer').value = checkoutInfo.cvv;
    document.querySelector('#order_terms').checked = true;
    setTimeout(() => {
        document.querySelector('#pay input.button').click();
    }, 500);
}

//获取随机正数
const getRandom = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}