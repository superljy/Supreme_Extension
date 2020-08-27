console.log('Hand Bot Forever');

//延迟
let delay = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    })
}

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'supreme') {
        port.onMessage.addListener(async (res) => {
            console.log(res);
            await delay(1000);
            addToCart();
        })
    }
})
chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
    console.log(res);
    window.localStorage.setItem('customInfo', JSON.stringify(res));
    window.sessionStorage.setItem('customInfo', JSON.stringify(res));

    sendResponse('链接:' + location.href);
    let baseUrl = 'https://www.supremenewyork.com/shop/all/';
    location.href = baseUrl + res.category;
})

// chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
//     if (res.info !== 'start') {
//         return;
//     }
//     addToCart();
// })

//chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
//获取商品和颜色
// window.onload = () => {
//     let productArr = document.querySelectorAll('.product-name .name-link');
//     let colorArr = document.querySelectorAll('.product-style .name-link');
//     for (let i = 0; i < productArr.length; i++) {
//         if (productArr[i].innerHTML.indexOf(firstUpperCase(res.keyword)) !== -1 && colorArr[i].innerHTML.indexOf(res.color) !== -1) {
//             productArr[i].click();
//             break;
//         }
//     }
//     //进入商品后获取尺码选项 选中尺码并加车
//     window.onload = async () => {
//         let productSizeSelectArr = document.querySelectorAll('select#s option');
//         for (let i = 0; i < productSizeSelectArr.length; i++) {
//             if (productSizeSelectArr[i].innerHTML.indexOf(res.size) !== -1) {
//                 productSizeSelectArr[i].selected = true;
//                 break;
//             }
//         }
//         document.querySelector('#add-remove-buttons input').click();
//         //加车后点击进入结账页面
//         await delay(500);
//         document.querySelector('#cart a.checkout').click();
//     }
// }
//})

let addToCart = () => {
    let customInfo = window.localStorage.getItem(JSON.parse(customInfo));
    if (location.href === 'https://www.supremenewyork.com/shop/all/' + customInfo.category) {

        let productArr = document.querySelectorAll('.product-name .name-link');
        let colorArr = document.querySelectorAll('.product-style .name-link');

        console.log(customInfo);

        for (let i = 0; i < productArr.length; i++) {
            if (productArr[i].innerHTML.indexOf(customInfo.keyword) !== -1 && colorArr[i].innerHTML.indexOf(customInfo.color) !== -1) {
                productArr[i].click();
            }
        }

    }
}
