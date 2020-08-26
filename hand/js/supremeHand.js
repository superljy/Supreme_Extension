/*
url:https://www.supremenewyork.com/shop/all/xxx xxx表示类目
*/
//delay
console.log('Handbot forever');
let delay = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    })
}
//首字母大写
let firstUpperCase = ([first, ...rest]) => {
    return first.toUpperCase() + rest.join('');
}

// let addToCart = () => {
//     //定义基础url路径
//     let baseUrl = 'https://www.supremenewyork.com/shop/all/';

//     //获取类目,关键字,尺码,延迟时间
//     let category = document.querySelector('#category').value;
//     let customKeyword = document.querySelector('#keyword-input').value;
//     let customColor = document.querySelector('#color-input').value;
//     let customSize = document.querySelector('#size-input').value;
//     let customDelay = document.querySelector('#delay-input').value;
//     //跳转
//     location.href = baseUrl + category;

//     //获取商品和颜色
//     window.onload = () => {
//         let productArr = document.querySelectorAll('.product-name .name-link');
//         let colorArr = document.querySelectorAll('.product-style .name-link');
//         for (let i = 0; i < productArr.length; i++) {
//             if (productArr[i].innerHTML.indexOf(firstUpperCase(customKeyword)) !== -1 && colorArr[i].innerHTML.indexOf(customColor) !== -1) {
//                 productArr[i].click();
//                 break;
//             }
//         }
//         //进入商品后获取尺码选项 选中尺码并加车
//         window.onload = async () => {
//             let productSizeSelectArr = document.querySelectorAll('select#s option');
//             for (let i = 0; i < productSizeSelectArr.length; i++) {
//                 if (productSizeSelectArr[i].innerHTML.indexOf(customSize) !== -1) {
//                     productSizeSelectArr[i].selected = true;
//                     break;
//                 }
//             }
//             document.querySelector('#add-remove-buttons input').click();
//             //加车后点击进入结账页面
//             await delay(500);
//             document.querySelector('#cart a.checkout').click();
//         }
//     }
// }

// document.querySelector('#start-btn').onclick = addToCart();

