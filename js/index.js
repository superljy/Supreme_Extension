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

/**
 * 第一次短连接
 * 接收第一次popup端发送过来的用户输入信息,并在本地缓存起来,方便页面跳转后再次使用同样的信息
 * 写入缓存并控制跳转 发送response到popup端告知第一步已完成
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

/**
 * 第二次短连接
 * 第二次发起的连接,判断msgSymbol,进行商品搜索和加车操作
 */

chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
    if (res.msgSymbol === 'search and add') {
        sendResponse('start to add');
        addToCart();
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
    //先确保keyword如果多个单词的话 每个单词首字母要大写
    let kw = customInfo.keyword;
    for (k of kw) {
        firstUpperCase(k);
    }
    customInfo.keyword = kw;
    //确保进入相应分类页面
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
 * @param {Array 页面中所有商品标题的数组} productArr 
 * @param {Array 对应商品颜色的数组} colorArr 
 * @param {Object 自定义关键字 颜色 尺码信息} customInfo 
 */
const selectProduct = (productArr, colorArr, customInfo) => {
    //判断是否存在多个关键字,若是,则进入判断 并返回多关键字匹配后的productArr 直接供后续颜色尺码选择用
    if (customInfo.keyword.length > 1) {
        //将多个关键字的用管道符拼接成以管道符分隔的字符串
        let mutilKeywordString = customInfo.keyword.join('|');
        //将分隔后的字符串作为正则的公式
        let mutilKeywordReg = new RegExp(mutilKeywordString, 'ig');
        let newProductArr = [];
        for (let i = 0; i < productArr.length; i++) {
            //查找与正则公式匹配的商品
            if (mutilKeywordReg.test(productArr[i].innerHTML)) {
                newProductArr.push(productArr[i]);
            }
        }
        //将productArr更新为经过正则筛选后的新商品列表(都是满足关键字的商品)
        productArr = newProductArr;
    }
    //若颜色填写random 则进入此处 利用颜色和商品数量是对应的关系 直接随机选取一件匹配关键字的商品 达到随机颜色的效果
    if (customInfo.color.toLowerCase() === 'random') {
        let newProduct = [];
        for (let i = 0; i < productArr.length; i++) {
            if (productArr[i].innerHTML.indexOf(firstUpperCase(customInfo.keyword[0])) !== -1) {
                newProduct.push(productArr[i]);
            }
        }
        let productIndex = getRandom(0, newProduct.length - 1);
        newProduct[productIndex].click();
        return;
    }
    //若没有多个关键字且指定了一个颜色的,直接查找对应关键字和颜色的商品
    for (let i = 0; i < productArr.length; i++) {
        if (productArr[i].innerHTML.indexOf(firstUpperCase(customInfo.keyword[0])) !== -1 && colorArr[i].innerHTML.indexOf(firstUpperCase(customInfo.color)) !== -1) {
            productArr[i].click();
            break;
        }
    }
}

/**
 * 判断尺码并进行加车方法 中间会判断商品是否已售罄
 * @param {Array 尺码数组} sizeArr 
 * @param {Object 自定义关键字 颜色 尺码信息} customInfo 
 */
const selectSize = (sizeArr, customInfo) => {
    //增加判断当前商品是否处于sold out状态 是则跳出提示 否则选择尺码
    let soldOut = document.querySelector('#add-remove-buttons b.sold-out');
    if (soldOut) {
        alert('Product Sold-out,please retry or change product..');
    } else {
        //尺码项是random的处理 先自动随机选取尺码 复制到customInfo.size上
        const sizes = ['Small', 'Medium', 'Large', 'XLarge'];
        if (customInfo.size.toLowerCase() === 'random') {
            let sizeIndex = getRandom(0, 3);
            customInfo.size = sizes[sizeIndex];
        }
        //根据customInfo.size选取对应尺码
        for (let i = 0; i < sizeArr.length; i++) {
            if (sizeArr[i].innerHTML.indexOf(customInfo.size) !== -1) {
                sizeArr[i].selected = true;
                break;
            }
        }
        document.querySelector('#add-remove-buttons input').click();
    }

}

/**
 * 加入购物车成功后进入结账页面 自动填充地址信用卡信息进行结账
 * @param {object 包含billing和vcc信息} checkoutInfo 
 */
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

//获取随机正数 这里用于颜色和尺码是random时的处理
const getRandom = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}