window.onload = function(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './php/status.json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            var loginLink = document.getElementById('login-link');
            if (response.success === true) {
                loginLink.innerHTML = '<a href="user.html">ユーザー</a>';
            } else {
                loginLink.innerHTML = '<a href="login.html">ログイン</a>';
            }
        }
    };
    xhr.send();
    var canvas = document.getElementById("canvas");
    var context =canvas.getContext("2d");
    var W = window.innerWidth;
    var H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    var fontSize = 16;
    var colunms = Math.ceil(W /fontSize);
    var row = Math.ceil(H /fontSize);
    var drops = [];
    for(var i=0;i<colunms;i++){
        drops.push(0);
    }
    var ran_n = Math.floor(Math.random() * 9) + 2;
    var n = colunms / 5;
    var n_1 = n * 3 / 5;
    var n_2 = n_1 / 4;
    var m = row / 2;
    var m_1 = m / 5;
    var m_2 = m_1*3 / 5;
    var shi = [];
        for (var a = 0; a < 10000; a++) {
            shi.push([]);
            for ( var k = 0; k < colunms; k++) {
                if (k % ran_n == 0 && a % ran_n == 0) {
                    shi[a].push(0);
                } else if (a > m-m_1*2  && a < m+m_1 && k > n+n_2  && k < n+n_1-n_2 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2  && a < m+m_1 && k > n+n_1  && k < n+n_1+n_2 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2  && a < m+m_1 && k > n+n_1*2-n_2  && k < n+n_1*2 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2  && a < m+m_1 && k > n+n_1*2+n_2*1.5  && k < n+n_1*3-n_2*1.5 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2  && a < m-m_1*2+m_2 && k > n+n_1  && k < n+n_1*2 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2+m_2*2  && a < m-m_1*2+m_2*3 && k > n+n_1  && k < n+n_1*2 ) {
                    shi[a].push(2);
                } else if (a > m+m_1-m_2  && a < m+m_1 && k > n+n_1*2+n_2 && k < n+n_1*3-n_2 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2  && a < m-m_1*2+m_2 && k > n+n_1*2+n_2*1.5 - ((n+n_1*2+n_2*1.5) - (n+n_1*2+n_2)) / 2 && k < n+n_1*3-n_2*1.5 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2  && a < m-m_1*2+m_2 && k > n+n_1*3  && k < n+n_1*4-n_2 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2+m_2*2  && a < m-m_1*2+m_2*2+m_2 && k > n+n_1*3  && k < n+n_1*4-n_2 ) {
                    shi[a].push(2);
                } else if (a > m+m_1-m_2  && a < m+m_1 && k > n+n_1*3  && k < n+n_1*4-n_2 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2  && a < m+m_1 && k > n+n_1*4  && k < n+n_1*4+n_2 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2  && a < m+m_1 && k > n+n_1*5-n_2  && k < n+n_1*5 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2  && a < m-m_1*2+m_2 && k > n+n_1*4  && k < n+n_1*5 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2+m_2*2  && a < m-m_1*2+m_2*3 && k > n+n_1*4  && k < n+n_1*5 ) {
                    shi[a].push(2);
                } else if (a > m-m_1*2  && a < m-m_1*2+m_2*3 && k > n+n_1*4-n_2*2  && k < n+n_1*4-n_2 ) {
                    shi[a].push(2);
                } else if (a > m+m_1-m_2*2  && a < m+m_1 && k > n+n_1*3  && k < n+n_1*3+n_2 ) {
                    shi[a].push(2);
                } else {
                    shi[a].push(1);
                }
            }
        }

    var str ="01234567890";
    function draw(){
        context.fillStyle = "rgba(0,0,0,0.05)";
        context.fillRect(0,0,W,H);
        context.font = "700 "+fontSize+"px  微软雅黑";
        context.fillStyle ="#00cc33";  
        for(var i=0;i<colunms;i++){                       
            var index = Math.floor(Math.random() * str.length);
            var x = i*fontSize;
            var y = drops[i] *fontSize;
            if (shi[drops[i]][i] == 1) {
                context.fillText(str[index],x,y);
            } 
            drops[i]++;

            if (i > n && i < n*4+n_2 ) {
                if(drops[i] > row ) {
                    drops[i] = 0;
                } 
            } else {
                if (drops[i] > row && Math.random() > 0.99) {
                    drops[i] = 0;
                }
            }                        
        }                
    }

    draw();
    setInterval(draw,50);
};