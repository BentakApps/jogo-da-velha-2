let tabuleiro = [
   [0,0,0],
   [0,0,0],
   [0,0,0],
];
let tamanhoCanvas;
let tamanhoTabuleiro;
let inicioTabuleiro;
let quadrado;
let jogoIniciado = false;
let margem = .1;//Margem em volta do tabuleiro para colocar as peças restantes (em relação ao tamanhoCanvas)
let escala = .6;//Quanto o simbolo vai ocupar do quadrado
let espessura;
//jogador 1: X
//jogador -1: O
let jogador = 1;
let vencedor = null;
let ia = 0;
let selecionado = {i: null, j:null, k:null, l:null, x:null, y:null, peca:null, jogador:null};

let pecas = {
   "1": [[1,1,1],[1,1,1],[1,1,1]],
   "-1": [[1,1,1],[1,1,1],[1,1,1]]
};//peças pequenas, médias e grandes. 3 de cada.

let profundidadeMaxima = 3;
let resultados =0;
let progresso = 0;
let tempoInicial = null;
let x0 = 0;
let y0 = 0;
let deltaX = 0;
let deltaY = 0;

let linha = null;
let coluna = null;
let diagonalPrincipal = null;
let diagonalSecundaria = null;

let inteligencia = new Worker('escolheJogada.js');
inteligencia.onmessage = function(event){
   if(event.data.resultado){
      jogada = event.data.resultado;
      executaJogada(jogada);
      profundidadeMaxima += 0.34;
      progresso = 0;
   } else {
      progresso = event.data;
   }
}

function executaJogada(jogada){
   let l;
   for(l=0; l<3; l++){
      if(pecas[jogador][jogada.k][l] != 0) {
         selecionado.x = pecas[jogador][jogada.k][l];
         pecas[jogador][jogada.k][l] = 0;
         break;
      }
   }
   selecionado.k = jogada.k;
   selecionado.l = l;
   selecionado.jogador = jogador;
   selecionado.peca = pecas[jogador][jogada.k][l];
   selecionado.i = jogada.i;
   selecionado.j = jogada.j;
   
   if(jogador == 1){
      selecionado.y = margem * tamanhoCanvas / 2;
   } else {
      selecionado.y = tamanhoCanvas * (1 - margem / 2)
   }
}

let canvas = document.querySelector('canvas');
let fundo = document.createElement('canvas').getContext('2d', { alpha:true, desynchronized:true });
let ctx = canvas.getContext('2d');
let menu = document.querySelector('#menu');
let canvasDiv = document.querySelector('.canvas-div');

window.addEventListener('resize', () => {
   desenhaCanvas();
   desenhaJogadas();
   vencedor = checaVencedor();
});

canvas.addEventListener('mousedown', e => cliqueMouse(e));
canvas.addEventListener('mousemove', e => moveMouse(e));
canvas.addEventListener('mouseup', e => soltaMouse(e));
desenhaCanvas();
window.requestAnimationFrame(t => desenhaTudo(t));

function desenhaCanvas(){
   tamanhoCanvas = Math.min(document.documentElement.clientWidth,document.documentElement.clientHeight);
   canvasDiv.setAttribute("style",
      "width:" + tamanhoCanvas + 'px;' +
      "height:" + tamanhoCanvas + 'px;' +
      "font-size:" + tamanhoCanvas/25 + 'px'
   );
   ctx.canvas.height = tamanhoCanvas;
   ctx.canvas.width = tamanhoCanvas;
   fundo.canvas.height = tamanhoCanvas;
   fundo.canvas.width = tamanhoCanvas;
   tamanhoTabuleiro = (1 - 2*margem) * tamanhoCanvas;
   inicioTabuleiro = margem * tamanhoCanvas;
   quadrado = tamanhoTabuleiro / 3;
   espessura = quadrado / 20
   ctx.lineWidth = espessura;
   desenhaTabuleiro();
}
   // desenhaJogadas();
   // mudaJogador(jogador);
   // if(jogoIniciado){
   //    menu.setAttribute("style", "display: none;");
   // } else {
   //    menu.setAttribute("style", "display: flex;");
   // }
   // }

function desenhaTudo(t){
   ctx.clearRect(0,0,tamanhoCanvas,tamanhoCanvas);
   ctx.drawImage(fundo.canvas, 0, 0);
   desenhaJogadas();
   desenhaSelecionado(t);
   desenhaProgresso();
   desenhaResultado();
   window.requestAnimationFrame(desenhaTudo);
}

function cliqueMouse(e){
   //console.log(vencedor);
   if(jogoIniciado){
      if(vencedor != null){
         //reinicia jogo
         //mudaJogador(1);
         jogador = 1;
         vencedor = null;
         tabuleiro = [
            [0,0,0],
            [0,0,0],
            [0,0,0],
         ];
         pecas = {
            "1": [[1,1,1],[1,1,1],[1,1,1]],
            "-1": [[1,1,1],[1,1,1],[1,1,1]]
         };
         
         linha = null;
         coluna = null;
         diagonalPrincipal = null;
         diagonalSecundaria = null;

         selecionado = {i: null, j:null, k:null, l:null, x:null, y:null, peca:null, jogador:null};
         
         profundidadeMaxima = 3;
         if(ia == 1) inteligencia.postMessage({tabuleiro:tabuleiro, pecas:pecas, jogador:jogador, profundidadeMaxima:profundidadeMaxima});
         return;
      }

      let pos = posicaoCursor(e);
      if(pos.y <= inicioTabuleiro && jogador == 1){
         procura:
         for(let k = 0; k < 3; k++){
            for(let l = 0; l < 3; l++){
               if(pos.x > pecas[jogador][k][l] - tamanhoTabuleiro / 20 &&
                  pos.x < pecas[jogador][k][l] + tamanhoTabuleiro / 20 &&
                  jogador != ia){
                  selecionado.k = k;
                  selecionado.l = l;
                  selecionado.jogador = 1;
                  selecionado.peca = pecas[jogador][k][l];
                  selecionado.x = pos.x;
                  selecionado.y = pos.y;
                  pecas[jogador][k][l] = 0;
                  break procura;
               }
            }
         }
         // ctx.clearRect(0, 0, tamanhoCanvas, tamanhoCanvas);
         // desenhaTabuleiro();
         // desenhaJogadas();
         // ctx.beginPath();
         // ctx.fillStyle = 'blue';
         // let raio = ((selecionado.k/10 + margem) * tamanhoCanvas)/8
         // ctx.ellipse(pos.x, pos.y, raio, raio,0,0,2*Math.PI);
         // ctx.fill();
      }
      if(pos.y >= inicioTabuleiro + tamanhoTabuleiro && jogador == -1){
         procura:
         for(let k = 0; k < 3; k++){
            for(let l = 0; l < 3; l++){
               if(pos.x > pecas[jogador][k][l] - tamanhoTabuleiro / 20 && 
                  pos.x < pecas[jogador][k][l] + tamanhoTabuleiro / 20 &&
                  jogador != ia){
                  selecionado.k = k;
                  selecionado.l = l;
                  selecionado.jogador = -1;
                  selecionado.peca = pecas[jogador][k][l];
                  selecionado.x = pos.x;
                  selecionado.y = pos.y;
                  pecas[jogador][k][l] = 0;
                  break procura;
               }
            }
         }
         // ctx.clearRect(0, 0, tamanhoCanvas, tamanhoCanvas);
         // desenhaTabuleiro();
         // desenhaJogadas();
         // ctx.beginPath();
         // ctx.fillStyle = 'red';
         // let raio = ((selecionado.k/10 + margem) * tamanhoCanvas)/8
         // ctx.ellipse(pos.x, pos.y, raio, raio,0,0,2*Math.PI);
         // ctx.fill();
      }
   }
}
function moveMouse(e){
   if(selecionado.jogador !== null && jogador !== ia){
      // ctx.clearRect(0, 0, tamanhoCanvas, tamanhoCanvas);
      // desenhaTabuleiro();
      // desenhaJogadas();
      
      let pos = posicaoCursor(e);
      selecionado.x = pos.x;
      selecionado.y = pos.y;
      // ctx.beginPath();
      // if(selecionado.jogador == 1) {
      //    ctx.fillStyle = 'blue';
      // } else {
      //    ctx.fillStyle = 'red';
      // }
      // let raio = ((selecionado.k/10 + margem) * tamanhoCanvas)/8
      // ctx.ellipse(pos.x, pos.y, raio, raio,0,0,2*Math.PI);
      // ctx.fill();
   }
}

function soltaMouse(e){
   if(selecionado.jogador !== null && jogador !== ia){
      let pos = posicaoCursor(e);
      if(pos.y > inicioTabuleiro && pos.y < inicioTabuleiro + tamanhoTabuleiro &&
         pos.x > inicioTabuleiro && pos.x < inicioTabuleiro + tamanhoTabuleiro){ 
         if(Math.abs(tabuleiro[pos.i][pos.j]) < Math.abs(selecionado.k) + 10){
            tabuleiro[pos.i][pos.j] = jogador * (10 + selecionado.k);
            // ctx.clearRect(0, 0, tamanhoCanvas, tamanhoCanvas);
            // setTimeout(()=>{
            //    desenhaTabuleiro();
            //    desenhaJogadas();
            // },10);            
            //desenhaPeca(pos.i,pos.j,selecionado.k,selecionado.jogador);
            selecionado = {i:null, j:null, k:null, l:null, x:null, y:null, peca:null, jogador:null};
            //desenhaTudo();
            vencedor = checaVencedor();
            if(vencedor == null){
               jogador = -jogador;
               //mudaJogador(-jogador);
               if(ia == jogador){
                  inteligencia.postMessage({tabuleiro:tabuleiro, pecas:pecas, jogador:jogador, profundidadeMaxima:profundidadeMaxima});
                  //setTimeout(escolheJogada(),1000);
                  //escolheJogada();
               }
            }
         } else {
            pecas[selecionado.jogador][selecionado.k][selecionado.l] = selecionado.peca;
            //voltaPeca();
         }
      } else {
         pecas[selecionado.jogador][selecionado.k][selecionado.l] = selecionado.peca;
         //voltaPeca();
      }
      selecionado = {i: null, j:null, k:null, l:null, x:null, y:null, peca:null, jogador:null};
   }
}

//let voltaPeca = () => {
   //ctx.clearRect(0, 0, tamanhoCanvas, tamanhoCanvas);
   // pecas[selecionado.jogador][selecionado.k][selecionado.l] = selecionado.peca;
   // return;
   // desenhaTabuleiro();
   // desenhaJogadas();
//}

function posicaoCursor(e){
   let x = e.offsetX;
   let y = e.offsetY
   let i = Math.floor((x - inicioTabuleiro) / quadrado);
   let j = Math.floor((y - inicioTabuleiro) / quadrado);
   return {x:x, y:y, i:i, j:j};
}

function checaVencedor(){
      // console.log("-----");
      // console.log(tabuleiro[0][0], tabuleiro[1][0], tabuleiro[2][0]);
      // console.log(tabuleiro[0][1], tabuleiro[1][1], tabuleiro[2][1]);
      // console.log(tabuleiro[0][2], tabuleiro[1][2], tabuleiro[2][2]);
   let vencedorTemp = null;
   //let somaLinha = 0;
   let menor = Infinity;
   for(let i = 0; i < 3; i++){
      let resultadoLinha = tabuleiro[0][i] + tabuleiro[1][i] + tabuleiro[2][i];
      //console.log(i, resultadoLinha);
      if(resultadoLinha <= -30 || resultadoLinha >= 30){
         vencedorTemp = Math.sign(tabuleiro[0][i]);
         linha = i;
         // console.log(vencedorTemp);
         // console.log(linha);
      }
      let resultadoColuna = tabuleiro[i][0] + tabuleiro[i][1] + tabuleiro[i][2];
      if(resultadoColuna <= -30 || resultadoColuna >= 30){
         vencedorTemp= Math.sign(tabuleiro[i][0]);
         coluna = i;
      }
      //somaLinha += Math.abs(Math.sign(tabuleiro[0][i])) + Math.abs(Math.sign(tabuleiro[1][i])) + Math.abs(Math.sign(tabuleiro[2][i]));
      if(Math.abs(tabuleiro[0][i]) < menor) menor = Math.abs(tabuleiro[0][i]);
      if(Math.abs(tabuleiro[1][i]) < menor) menor = Math.abs(tabuleiro[1][i]);
      if(Math.abs(tabuleiro[2][i]) < menor) menor = Math.abs(tabuleiro[2][i]);
   }
   let resultadoDiagonalPrincipal = tabuleiro[0][0] + tabuleiro[1][1] + tabuleiro[2][2];
   if(resultadoDiagonalPrincipal <= -30 || resultadoDiagonalPrincipal >= 30){
      vencedorTemp = Math.sign(tabuleiro[0][0]);
      diagonalPrincipal = 1;
   }
   let resultadoDiagonalSecundaria = tabuleiro[0][2] + tabuleiro[1][1] + tabuleiro[2][0];
   if(resultadoDiagonalSecundaria <= -30 || resultadoDiagonalSecundaria >= 30){
      vencedorTemp = Math.sign(tabuleiro[0][2]);
      diagonalSecundaria = 1;
   }
   let pecasRestantes = 0;
   let empate = true;''
   for(k=0; k<3; k++) {
      for(l=0; l<3; l++){
         pecasRestantes += pecas[1][k][l];
         pecasRestantes += pecas[-1][k][l];
         if(pecas[-jogador][k][l] > 0 && 10 + k > menor) empate = false;
         //if(pecas[-1][k][l] > 0 && 10 + k > menor) empate = false;
      }
   }
   if(vencedorTemp == null && (empate || pecasRestantes == 0)) vencedorTemp = 0;
   // console.log(vencedorTemp);
   if(vencedorTemp !== null) jogador = 0;
   return vencedorTemp;
}

//Opções do menu principal
let doisJogadores = () => {
   jogoIniciado = true;
   jogador = 1;
   menu.setAttribute("style", "display: none;");
   // resizeCanvas();
   // mudaJogador(1);
}

let jogadorX = () => {
   jogoIniciado = true;
   ia = -1;
   jogador = 1;
   menu.setAttribute("style", "display: none;");
   // resizeCanvas();
   // ia = -1;
   // mudaJogador(1);
}

let jogadorO = () => {
   jogoIniciado = true;
   ia = 1;
   jogador = 1;
   menu.setAttribute("style", "display: none;");
   // resizeCanvas();
   // mudaJogador(ia);
   //escolheJogada();
   inteligencia.postMessage({tabuleiro:tabuleiro, pecas:pecas, jogador:jogador, profundidadeMaxima:profundidadeMaxima});
}

function desenhaTabuleiro(){
   fundo.beginPath();
   fundo.lineWidth = espessura;
   fundo.strokeStyle = "#000000";
   fundo.moveTo(inicioTabuleiro + quadrado, inicioTabuleiro);
   fundo.lineTo(inicioTabuleiro + quadrado, inicioTabuleiro + tamanhoTabuleiro);
   fundo.moveTo(inicioTabuleiro + 2*quadrado, inicioTabuleiro);
   fundo.lineTo(inicioTabuleiro + 2*quadrado, inicioTabuleiro + tamanhoTabuleiro);
   fundo.moveTo(inicioTabuleiro, inicioTabuleiro + quadrado);
   fundo.lineTo(inicioTabuleiro + tamanhoTabuleiro, inicioTabuleiro + quadrado);
   fundo.moveTo(inicioTabuleiro, inicioTabuleiro + 2*quadrado);
   fundo.lineTo(inicioTabuleiro + tamanhoTabuleiro, inicioTabuleiro + 2*quadrado);
   fundo.stroke();
}

let desenhaJogadas = () => {
   //Desenha peças a jogar
   for(let k=0; k<3; k++){
      for(let l=0; l<3; l++){
         let posicao = inicioTabuleiro + tamanhoTabuleiro * (1 + l + k * 3) / 10;
         let tamanho = ((k/10 + margem) * tamanhoCanvas)/8;
         if(pecas[1][k][l] > 0){
            pecas[1][k][l] = posicao;
            ctx.beginPath();
            ctx.fillStyle = 'blue';
            ctx.ellipse(posicao, margem * tamanhoCanvas / 2, tamanho, tamanho,0,0,2*Math.PI);
            ctx.fill();
         }
         if(pecas["-1"][k][l] > 0){
            pecas["-1"][k][l] = posicao;
            ctx.beginPath();
            ctx.fillStyle = 'red';
            ctx.ellipse(posicao, tamanhoCanvas * (1 - margem / 2), tamanho, tamanho,0,0,2*Math.PI);
            ctx.fill();
         }
      }
   }

   //Desenha peças jogadas
   for(let i = 0; i < 3; i++){
      for(let j = 0; j < 3; j++){
         if(tabuleiro[i][j] !== 0) desenhaPeca(i, j, Math.abs(tabuleiro[i][j]) - 10, Math.sign(tabuleiro[i][j]));
      }
   }

   //Desenha jogador atual
   ctx.beginPath();
   ctx.strokeStyle = '#00ff00';
   if(jogador == 1){
      ctx.rect(inicioTabuleiro + espessura/2, espessura/2, tamanhoTabuleiro - espessura, margem * tamanhoCanvas - espessura);
   }
   if(jogador == -1){
      ctx.rect(inicioTabuleiro + espessura/2, inicioTabuleiro + tamanhoTabuleiro + espessura/2, tamanhoTabuleiro - espessura, margem * tamanhoCanvas - espessura);
   }
   ctx.stroke();

   

}

// let desenhaX = (i,j) => {
//    let cantoX = i * quadrado;
//    let cantoY = j * quadrado;
//    let margem = (quadrado - quadrado * escala) / 2;
//    ctx.beginPath();
//    ctx.strokeStyle = "#000000";
//    ctx.moveTo(cantoX + margem, cantoY + margem);
//    ctx.lineTo(cantoX + margem + quadrado * escala, cantoY + margem + quadrado * escala);
//    ctx.moveTo(cantoX + margem + quadrado * escala, cantoY + margem);
//    ctx.lineTo(cantoX + margem, cantoY + margem + quadrado * escala);
//    ctx.stroke();
// }

let desenhaPeca = (i, j, tamanho, jogador) => {
   //console.log(i, j, tamanho, jogador);
   let cantoX = margem * tamanhoCanvas + i * quadrado;
   let cantoY = margem * tamanhoCanvas + j * quadrado;
   ctx.beginPath();
   ctx.strokeStyle = "#000000";
   if(jogador == 1){
      ctx.fillStyle = 'blue';
   } else {
      ctx.fillStyle = 'red';
   }
   let raio = ((tamanho/10 + margem) * tamanhoCanvas)/8
   ctx.ellipse(cantoX + quadrado / 2, cantoY + quadrado / 2, raio, raio,0,0,2*Math.PI);
   ctx.fill();
}

// //Desenha linhas vencedoras
// let desenhaLinha = i => {
//    ctx.beginPath();
//    ctx.strokeStyle = "#ff0000";
//    ctx.moveTo(inicioTabuleiro, inicioTabuleiro + i * quadrado + quadrado / 2);
//    ctx.lineTo(inicioTabuleiro + tamanhoTabuleiro, inicioTabuleiro + i * quadrado + quadrado / 2);
//    ctx.stroke();
// }
// let desenhaColuna = i => {
//    ctx.beginPath();
//    ctx.strokeStyle = "#ff0000";
//    ctx.moveTo(inicioTabuleiro + i * quadrado + quadrado / 2, inicioTabuleiro);
//    ctx.lineTo(inicioTabuleiro + i * quadrado + quadrado / 2, inicioTabuleiro + tamanhoTabuleiro);
//    ctx.stroke();
// }
// let desenhaDiagonalPrincipal = () => {
//    ctx.beginPath();
//    ctx.strokeStyle = "#ff0000";
//    ctx.moveTo(inicioTabuleiro, inicioTabuleiro);
//    ctx.lineTo(inicioTabuleiro + tamanhoTabuleiro, inicioTabuleiro + tamanhoTabuleiro);
//    ctx.stroke();
// }
// let desenhaDiagonalSecundaria = () => {
//    ctx.beginPath();
//    ctx.strokeStyle = "#ff0000";
//    ctx.moveTo(inicioTabuleiro, inicioTabuleiro + tamanhoTabuleiro);
//    ctx.lineTo(inicioTabuleiro + tamanhoTabuleiro, inicioTabuleiro);
//    ctx.stroke();
// }

function desenhaSelecionado(t){
   if(selecionado.jogador !== null){
      if(selecionado.jogador == ia){
         if(!tempoInicial) {
            tempoInicial = t;
            x0 = selecionado.x;
            y0 = selecionado.y;
            deltaX = (margem * tamanhoCanvas + selecionado.i * quadrado + quadrado /2 - selecionado.x)/1000;   
            deltaY = (margem * tamanhoCanvas + selecionado.j * quadrado + quadrado /2 - selecionado.y)/1000;
         }
         let deltaT = t - tempoInicial;
         if(deltaT>1000){
            tabuleiro[selecionado.i][selecionado.j] = selecionado.jogador * (selecionado.k + 10);
            selecionado = {i: null, j:null, k:null, l:null, x:null, y:null, peca:null, jogador:null};
            x0 = 0;
            y0 = 0;
            deltaX = 0;
            deltaY = 0;
            tempoInicial = null;
            vencedor = checaVencedor();
            //console.log(vencedor);
            if(vencedor == null) jogador = -ia;
            return;
         }
         selecionado.x = x0 + deltaX * deltaT;
         selecionado.y = y0 + deltaY * deltaT;
      }
      if(selecionado.jogador == 1){
         ctx.fillStyle = 'blue';
      } else {
         ctx.fillStyle = 'red';
      }
      let raio = ((selecionado.k/10 + margem) * tamanhoCanvas)/8
      ctx.beginPath();
      ctx.ellipse(selecionado.x, selecionado.y, raio, raio,0,0,2*Math.PI);
      ctx.fill();
   }
}

function desenhaProgresso(){
   ctx.beginPath();
   ctx.fillStyle = 'green';
   let raio = (margem + 0.5) * tamanhoCanvas/8;
   ctx.arc(tamanhoCanvas / 2, tamanhoCanvas / 2, raio, -Math.PI/2, 2 * Math.PI * progresso / 27 - Math.PI/2);
   ctx.lineTo(tamanhoCanvas / 2, tamanhoCanvas / 2);
   // ctx.ellipse(tamanhoCanvas / 2, tamanhoCanvas / 2, raio, raio, 0, 0, 2 * Math.PI * progresso / 27);
   ctx.fill();
}

function desenhaResultado(){
   if(linha != null){
      ctx.beginPath();
      ctx.strokeStyle = "#00ff00";
      ctx.moveTo(inicioTabuleiro, inicioTabuleiro + linha * quadrado + quadrado / 2);
      ctx.lineTo(inicioTabuleiro + tamanhoTabuleiro, inicioTabuleiro + linha * quadrado + quadrado / 2);
      ctx.stroke();
   }
   if(coluna != null){
      ctx.beginPath();
      ctx.strokeStyle = "#00ff00";
      ctx.moveTo(inicioTabuleiro + coluna * quadrado + quadrado / 2, inicioTabuleiro);
      ctx.lineTo(inicioTabuleiro + coluna * quadrado + quadrado / 2, inicioTabuleiro + tamanhoTabuleiro);
      ctx.stroke();
   }
   if(diagonalPrincipal){
      ctx.beginPath();
      ctx.strokeStyle = "#00ff00";
      ctx.moveTo(inicioTabuleiro, inicioTabuleiro);
      ctx.lineTo(inicioTabuleiro + tamanhoTabuleiro, inicioTabuleiro + tamanhoTabuleiro);
      ctx.stroke();
   }
   if(diagonalSecundaria){
      ctx.beginPath();
      ctx.strokeStyle = "#00ff00";
      ctx.moveTo(inicioTabuleiro, inicioTabuleiro + tamanhoTabuleiro);
      ctx.lineTo(inicioTabuleiro + tamanhoTabuleiro, inicioTabuleiro);
      ctx.stroke();
   }
   //Desenha empate
   if(vencedor == 0){
      ctx.font = "30px gamefont";
      ctx.fillStyle = "#00ff00";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("EMPATE", tamanhoCanvas / 2, tamanhoCanvas / 2);
   }
}


// function atualizaProgresso(valor){
//    let completo = valor / 26;
//    console.log(completo);
// }
//Inicializa jogo
//resizeCanvas();


//
//
//
///
//
//
//
//
////
//
