function Mine(tr,td,num){
    this.tr = tr;
    this.td = td;
    this.num = num; //雷的数量

    this.squares = [];  // 二维数组
    this.tds= [];   //存取单元格的DOM对象
    this.surplusMine = num; //  剩余雷的数量
    this.allRight = false;
    this.parent = document.querySelector('.game-box');
}

//创建表格
Mine.prototype.createDom = function(){
    var This = this;
    var table = document.createElement('table');
    for (var i = 0; i < this.tr; i++){
        var domTr = document.createElement('tr');
        this.tds[i]= [];

        for (var j = 0; j < this.td ; j ++){
            var domTd = document.createElement('td');
            //domTd.innerHTML = 0; 
            domTd.pos = [i,j]
            domTd.onmousedown = function(){
                This.play(event,this);
            }

            this.tds[i][j] = domTd;

            // if(this.squares[i][j].type == 'boom'){
            //     domTd.className = 'boom';
            // }
            // if(this.squares[i][j].type == 'number'){
            //     domTd.innerHTML = this.squares[i][j].value;
            // }
            
            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = '';     //避免多次点击创建多个
    this.parent.appendChild(table);
};

//生成n个不重复的数字
Mine.prototype.randomNum = function(){
    var square = new Array(this.tr*this.td);
    for(var i = 0; i < square.length; i++){
        square[i] = i
    }
    square.sort(function(){ return 0.5-Math.random()});
    return square.slice(0,this.num);
};

//找某方格周围的所有方格
Mine.prototype.getAround = function(square){
    var x = square.x;
    var y = square.y;
    var result = [];    //返回找到的格子的坐标，二维数组

    for (var i = x-1; i < x+2; i++){
        for(var j = y-1; j < y+2; j++){
            if(
                i<0 || 
                j<0 ||
                i>this.td-1 ||
                j>this.tr-1 ||
                (i==x && j==y)||
                this.squares[j][i].type=='boom'
            ){
                continue;
            }
            result.push([j,i]);
        }

    }
    return result;

}

//更新所有的数字
Mine.prototype.updateNum = function(){
    for(var i = 0; i < this.tr; i++){
        for (var j = 0; j < this.td; j++){
            if(this.squares[i][j].type == 'number'){
                continue;
            }

            var num = this.getAround(this.squares[i][j]);
            for(var k =0; k< num.length; k++){
                this.squares[num[k][0]][num[k][1]].value+=1;  
            }       
        }
    }
    //console.log(this.squares)
}


Mine.prototype.init=function(){
    var rn = this.randomNum();      //雷在格子里的位置
    var n = 0;  //找到格子对应的索引
    var NUM = this.num;
    for (var i = 0; i < this.tr; i++){
        this.squares[i] = [];
        for(var j = 0; j <this.td; j++){
            //this.squares[i][j] = ;
            //方块数组里的数据，使用行列的方式，找周围方块用坐标去取，行与列的形式和坐标的形式，刚好相反
            if(rn.indexOf(++n)!=-1){
                this.squares[i][j] = {type:'boom',x:j,y:i};
            }else{
                this.squares[i][j] = {type:'number',x:j,y:i,value:0};
            }
        }
        
    }
    this.updateNum();
    this.createDom();

    this.parent.oncontextmenu = function(){ // 阻止右键
            return false;
    };
    //剩余雷数
    this.mineNumDom = document.querySelector('.num');
    this.mineNumDom.innerHTML = this.surplusMine;
};

Mine.prototype.play=function(ev,obj){
    var This = this;
    if(ev.which == 1 && obj.className!= 'flag'){
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero','one','two','three','four','five','six','seven','eight'];

        if(curSquare.type == 'number'){
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value]
            if(curSquare.value == 0){
                obj.className = cl[0];
                function getAllZero(square){
                    var around = This.getAround(square);    //找到了周围的n个格子
                    for(var i = 0; i< around.length; i++){
                        var x = around[i][0];
                        var y = around[i][1];

                        This.tds[x][y].className = cl[This.squares[x][y].value];
                        
                        if(This.squares[x][y].value == 0){      //  周围数字为0
                            if(!This.tds[x][y].check){
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]);
                            }
                        }else{      //  周围数字不为0
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare)
            }
        }else{
            this.gameOver(obj);
        }
    } 
    if (ev.which == 3){
        if(obj.className && obj.className != 'flag'){
            return ;
        }
        obj.className = obj.className=='flag'?'' : 'flag';

        if(this.squares[obj.pos[0]][obj.pos[1]].type == 'boom'){
            this.allRight = true;
        }else{
            this.allRight = false;
        }
        if(obj.className == 'flag'){
            this.mineNumDom.innerHTML = --this.surplusMine;
        }else{
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }
        if(this.surplusMine == 0){
            if (this.allRight){
                alert("congratulations   恭喜你，排雷成功!")
            }else{
                alert("回去再练练吧！")
                this.gameOver
            }
        }
        
    }
}

Mine.prototype.gameOver = function(clickTd){
    for (i = 0; i < this.tr; i ++){
        for( var j = 0 ; j < this.td; j++){
            if(this.squares[i][j].type == 'boom'){
                this.tds[i][j].className = 'boom';

            }
            this.tds[i][j].onmousedown=null;  
        }
    }
    if (clickTd){
        clickTd.style.backgroundColor = 'red';

    }
}

//改变button功能
var btns = document.querySelectorAll('.level button')
var mine = null;
var ln = 0; //当前选中的状态
var arr = [[9,9,10],[16,16,40],[28,28,99]];

for (let i = 0 ; i < btns.length-1; i++){
    btns[i].onclick = function(){
        btns[ln].className='';
        this.className = 'active';

        mine = new Mine(...arr[i]);
        mine.init();
        ln = i;
    }
}
btns[0].onclick();  //初始化最简单的
// btns[3].onclick = function(){
//     mine.init();
// }
// var mine = new Mine(29,29,100)
// mine.init();

//console.log(mine.getAround(mine.squares[1][1]));