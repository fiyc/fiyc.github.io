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
            title: "emacs 改造之一场由代码折叠引发的血案",
            url: "article/hack-emacs-one.html",
            date: "2018-03-11 03:33:58"
        },
        {
            title: "Github + Hexo 搭建博客",
            url: "article/hexo.html",
            date: "2017-10-28 19:06:35"
        },
        {
            title: "JavaScript设计模式 - 构造器模式",
            url: "article/javascript-constructor-pattern.html",
            date: "2018-02-17 11:27:57"
        },
        {
            title: "JavaScript设计模式 - 模块化模式",
            url: "article/javascript-module-pattern.html",
            date: "2018-03-06 17:44:00"
        },
        {
            title: "npm设置国内源",
            url: "article/npm-domestic-source.html",
            date: "2017-11-17 10:11:33"
        },
        {
            title: "Spring 装配bean基础",
            url: "article/spring-wiring-bean.html",
            date: "2018-04-23 23:06:29"
        },
        {
            title: "Spring学习笔记",
            url: "article/spring-note.html",
            date: "2018-04-25 22:43:23"
        },
        {
            title: "实现简单的神经网络",
            url: "article/machine-learning-demo.html",
            date: "2018-02-14 23:05:07"
        },
        {
            title: "拖拽上传文件实现过程记录",
            url: "article/node-dragfile.html",
            date: "2018-03-30 13:30:55"
        },
        {
            title: "机器学习实战 k-近邻算法",
            url: "article/machine-learning-knn.html",
            date: "2018-02-25 19:15:50"
        },
        {
            title: "机器学习实战 使用香农熵划分数据集",
            url: "article/machine-learning-shannon.html",
            date: "2018-03-04 01:24:28"
        },
        {
            title: "深入浅出正则表达式【转载】",
            url: "article/regular-express.html",
            date: "2018-02-25 17:14:14"
        },
        {
            title: "跨域问题解析",
            url: "article/ajax-cross-domain.html",
            date: "2018-02-20 16:08:49"
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
