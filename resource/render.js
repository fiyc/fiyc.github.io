/**
* @Author: fiyc
* @Date : 2018-09-10 13:34
* @FileName : render.js
* @Description : 
    - 模板渲染以及数据脚本
*/

function init() {
    let listDOM = document.getElementById('list');
    let searchInput = document.getElementById('search-input');
    let data = [
        {
            title: "Python 装饰器理解 (1)",
            url: "article/python_decorator_1.html",
            date: "2018-09-11 14:07"
        },
        {
            title: "Python 装饰器理解 (2)",
            url: "article/python_decorator_2.html",
            date: "2018-09-11 14:07"
        },
        {
            title: "测试语法",
            url: "article/test.html",
            date: "2018-01-01 10:12"
        },
        {
            title: "机器学习实战 k-近邻算法",
            url: "article/machine_learn_knn.html",
            date: "2018-02-25 19:15:50"
        },
    ];

    data = data.sort(function(a, b){
        let aDate = a.date ? new Date(a.date) : new Date();
        let bDate = b.date ? new Date(b.date) : new Date();

        return bDate.getTime() - aDate.getTime();
    });


    let itemListTemplate = function (title, url, date) {
        let listItem = `<div class="list-item">
            <a class="list-link" href="${url}">${title} <span class="date"> ${date}</span></a>
        </div>`;

        return listItem;
    }

    let render = function(lists){
        let content = "";
        lists.forEach(item => {
           content += itemListTemplate(item.title, item.url, item.date); 
        });

        listDOM.innerHTML= content;
    }

    render(data);

    searchInput.addEventListener('keyup', function(){
        let searchValue = searchInput.value;
        if(!searchValue){
            render(data);
            return;
        }

        let searchMappings = [];
        data.forEach(item => {
            if(item.title.indexOf(searchValue) >= 0){
                searchMappings.push(item);
            }
        });

        // if(searchMappings.length === 0){
        //     searchMappings = data;
        // }

        render(searchMappings);
    });
}

init();
