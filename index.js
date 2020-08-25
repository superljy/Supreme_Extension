/*
url:https://www.supremenewyork.com/shop/all/xxx xxx表示类目



*/

(async function () {
    //获取商品和颜色
    let productArr = document.querySelectorAll('.product-name .name-link');
    let colorArr = document.querySelectorAll('.product-style .name-link');
    for (let i = 0; i < productArr.length; i++) {
        if (productArr[i].innerHTML.indexOf('Tagless') !== -1 && colorArr[i].innerHTML.indexOf('White') !== -1) {
            productArr[i].click();
        }
    }

    //进入商品后获取尺码选项 选中尺码并加车
    await delay(3000);
    let productSizeSelectArr = document.querySelectorAll('select#s option');
    for (let i = 0; i < productSizeSelectArr.length; i++) {
        if (productSizeSelectArr[i].innerHTML.indexOf('Medium') !== -1) {
            productSizeSelectArr[i].selected = true;
        }
    }
    document.querySelector('#add-remove-buttons input').click();

    //加车后点击进入结账页面
    await delay(500);
    document.querySelector('#cart a.checkout').click();
})();


//delay
let delay = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    })
}
//首字母大写
let firstUpperCase = ([first, ...rest]) => {
    return first.toUpperCase() + rest.join('');
}