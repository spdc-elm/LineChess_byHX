
// 创建全局变量
const color_list = ["#FF0000","#0000FF"]
const player_name = ['red','blue']
var player_score = [0,0]
var color = color_list[0];
var player = 0; // 0表示红方，1表示蓝方
var grids=[]
var limit=10000; // 限制连走步数
var counter = 0; // 计数器
var move_history=[]


function storeHistory() {
    localStorage.setItem('move_history', JSON.stringify(move_history));
  }

function loadHistory() {
    var storedHistory = JSON.parse(localStorage.getItem('move_history'));
    if (storedHistory !== null) {
      move_history = storedHistory;
    }
    recover_from_history(move_history);
}

function clear_all(){

    grids = document.getElementsByClassName('grid-item');
    for(let i = 0; i < h_borders.length; i++){
        h_borders[i].style.borderColor = '#cccccc';
        v_borders[i].style.borderColor = '#cccccc';
    }
    for(let i = 0; i < grids.length; i++){
        grids[i].style.backgroundColor = '#ffffff';
    }
    // 初始化状态
    player=0;
    player_score = [0,0];
    color = color_list[0];
    counter = 0;
    update_score();
    change_player(player);
}


function recover_from_history(move_history){
    clear_all()
    if(move_history.length == 0){
        setTimeout(function(){ alert("no history moves!"); }, 0);
        return;
    }
    for(let i = 0; i < move_history.length; i++){
        var id = move_history[i];
        if(id>=0){
            var element = h_borders[id];
        }else{
            id = -id-1;
            var element = v_borders[id];
        }
        
        process_click(element,history=false);
    }
    
}

function update_score(){
    var red_score = document.querySelector('.score_r');
    var blue_score = document.querySelector('.score_b');
    red_score.innerHTML = 'red: '+player_score[0];
    blue_score.innerHTML = 'blue: '+player_score[1];
}

class Grid{
    constructor(childs,grid){
        this.childs = childs; // 4元素的列表，存储4个边框
        this.grid = grid; // 存储当前格子

        this.grid.parent_obj = this;
        for(let i = 0; i < this.childs.length; i++){
            this.childs[i].parent_grid.push(this)
        }
    }

    isFull(){
        for(let i = 0; i < this.childs.length; i++){
            if(rgbToHex(this.childs[i].style.borderColor) == '#cccccc'){
                return false;
            }
        }
        return true;
    }
    color(color){
        this.grid.style.backgroundColor = color;
    }
    leftBorder(){
        var cnt = 0;
        for(let i = 0; i < this.childs.length; i++){
            if(rgbToHex(this.childs[i].style.borderColor) == '#cccccc'){
                cnt++;
            }
        }
        return cnt;
    }
}

function id2element(id){
    if(id>=0){
        var element = h_borders[id];
    }else{
        id = -id-1;
        var element = v_borders[id];
    }
    return element;
}

function getRandomInt(min, max) { 
    // 左闭右闭的随机取整数
    min = Math.ceil(min); // 向上取整
    max = Math.floor(max); // 向下取整
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function range(start, end) {
    // 也是左闭右闭
    return Array.from({ length: end - start + 1 }, (_, index) => index + start);
  }

function getRandomElementAndRemove(arr) {
    if (arr.length === 0) return undefined; // 如果数组为空，则返回undefined

    const randomIndex = Math.floor(Math.random() * arr.length); // 生成随机索引
    const removedElement = arr.splice(randomIndex, 1)[0]; // 移除随机元素并返回它
    return removedElement;
}
  

function random_move(){
    var available_grids_cnt = 0;
    for(let i = 0; i < grids.length; i++){
        var parent_grid = grids[i].parent_obj;
        if(parent_grid.leftBorder() > 2){
            available_grids_cnt++;
        }
    }
    if(available_grids_cnt == 0){
        alert("no available grids 没有可以随机移动的格子了");
        return;
    }
    var cnt = 0;
    var total = num*(num+1)
    var ids=range(-total,total-1);
    while(cnt<2*total){
        cnt++;
        var random_id = getRandomElementAndRemove(ids);
        var element = id2element(random_id);
        var parent_grids = element.parent_grid;

        var flag = true;
        if(rgbToHex(element.style.borderColor) != '#cccccc'){
            continue
        }
        for(i = 0; i < parent_grids.length; i++){
            if(parent_grids[i].leftBorder() <= 2){
                flag = false;
                break;
            }
        }
        if(flag){
            process_click(element);
            return;
        }
        
    }
    return;
}

function random_move_4(){
    for(let i = 0; i < 4; i++){
        random_move();
    }
}

function rgbToHex(rgb) {
    // 去除rgb()括号并分割字符串
    var parts = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    // 将RGB的每个部分转换为十六进制
    var hex = "#" + parts.slice(1).map(function (x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }).join("");
    return hex;
}

function roll_back(){
    if(move_history.length == 0){
        alert("no history moves!");
        return;
    }
    move_history.pop();
    recover_from_history(move_history);
}

function change_player(player){
    counter=0
    var redpoint = document.querySelector('.redpoint');
    var bluepoint = document.querySelector('.bluepoint');
    if(player == 0){
        redpoint.style.opacity = 1;
        bluepoint.style.opacity = 0;

    }else if(player == 1){
        redpoint.style.opacity = 0;
        bluepoint.style.opacity = 1;
    }

}

function process_click(element,his_mode=true) {
    // 进行游戏逻辑判定
    // 判断是否合法操作（格子是不是已经被涂色）
    if(rgbToHex(element.style.borderColor) != '#cccccc'){
        alert("the border has been colored");
        return;
    }

    // 合法操作，修改颜色
    color = color_list[player]; // 获取当前玩家的颜色
    
    let event = new CustomEvent('borderClick', { detail: { color: color } });
    element.dispatchEvent(event);  // 触发事件
    
    
    // 判断是否加分
    var parent_grid = element.parent_grid;
    var flag = false;
    for(let i = 0; i < parent_grid.length; i++){
        if(parent_grid[i].isFull()){
            parent_grid[i].color(color);
            player_score[player]++;
            flag = true;
        }
    }
    // 是否切换玩家
    var change_player_flag=true;
    if(flag){
        counter++;
        update_score();
        if(counter < limit){ // 连走最大步数限制
            change_player_flag = false;
        }else{
            counter = 0;
        }
    }

    // 记录历史
    if(his_mode){
        move_history.push(element.id);
        storeHistory();
    }
        

    // 切换玩家
    if(change_player_flag){
        player = (player+1)%2; 
        change_player(player);
    }
    

  }

function createGrid(n,grid_len) {
    const gridContainer = document.getElementById('g-grid');
    gridContainer.innerHTML = ''; // 清空容器
  
    // 创建边框
    for (let i = 0; i <= n; i++) {
        for(let j = 0; j <= n; j++) {
            if(i!=n && j!=n){
                const grid = document.createElement('div');
                grid.classList.add('grid-item');
                grid.style.marginTop = `${i * grid_len}px`;
                grid.style.marginLeft = `${j * grid_len}px`;
                grid.style.width = `${grid_len}px`;
                grid.style.height = `${grid_len}px`;
                gridContainer.appendChild(grid);
            }
            if(j!=n){
                const horizontalBorder = document.createElement('div');
                horizontalBorder.classList.add('horizontal-border');
                horizontalBorder.style.marginTop = `${i * grid_len}px`; 
                horizontalBorder.style.marginLeft = `${j * grid_len}px`;
                horizontalBorder.style.width = `${grid_len}px`;
                horizontalBorder.style.borderColor = '#ccc';
                horizontalBorder.parent_grid = []
                horizontalBorder.addEventListener('borderClick', function(e) {
                    this.style.borderColor = e.detail.color; // 改变颜色
                  });
                  horizontalBorder.addEventListener('click', function() {
                    /*
                    var hexColor = rgbToHex(this.style.borderColor);
                    console.log(hexColor);
                    if(hexColor != "#cccccc"){
                        process_click(this, "#ccc");
                    }*/
                    
                    process_click(this);
                    
                  });
                gridContainer.appendChild(horizontalBorder);
            }
            if(i!=n){
                const verticalBorder = document.createElement('div');
                verticalBorder.classList.add('vertical-border');
                verticalBorder.style.marginTop = `${i * grid_len}px`;
                verticalBorder.style.marginLeft = `${j * grid_len}px`;
                verticalBorder.style.height = `${grid_len}px`;
                verticalBorder.style.borderColor = '#ccc'; 
                verticalBorder.parent_grid = []
                verticalBorder.addEventListener('borderClick', function(e) {
                    this.style.borderColor = e.detail.color; // 改变颜色
                  });
                  verticalBorder.addEventListener('click', function() {
                    process_click(this);
                    
                  });
                gridContainer.appendChild(verticalBorder);
            }
            
        }  
    }
  
    window.h_borders = document.getElementsByClassName('horizontal-border');
    window.v_borders = document.getElementsByClassName('vertical-border');
    window.grids = document.getElementsByClassName('grid-item');
    for(let i = 0; i < n*n; i++){
        new Grid([h_borders[i],  h_borders[i+n],v_borders[(n+1)*Math.floor(i/n)+i%n], v_borders[(n+1)*Math.floor(i/n)+i%n+1]],grids[i]);
    }
    // 给每个边框编号
    for(let i = 0; i < h_borders.length; i++){
        h_borders[i].id = i;
        v_borders[i].id = -i-1;
    }
  }
  
function calculateGridLen(n){
    const gridContainer = document.getElementById('g-grid');
    return Math.floor(Math.min(gridContainer.clientWidth, gridContainer.clientHeight) / n);
}
  
  // 初始化 n×n 网格
  // 获取当前页面的URL
const url = new URL(window.location.href);
// 创建URLSearchParams对象
const searchParams = new URLSearchParams(url.search);
// 获取特定的URL参数
const num = parseInt(searchParams.get('n')); 
limit = parseInt(searchParams.get('lim')) || 10000;
if(num) {
    createGrid(num,calculateGridLen(num)); 
} else {
    createGrid(5,calculateGridLen(5)); 
}
