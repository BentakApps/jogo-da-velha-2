let tabuleiro = [];
self.onmessage = function(message){
   let data = message.data;
   escolheJogada(data.tabuleiro, data.pecas, data.jogador, data.profundidadeMaxima);
}

function escolheJogada(tabuleiro, pecas, jogador, profundidadeMaxima){
   let melhorPonto = -Infinity;
   let jogada;
   let progresso = 0;
   if(tabuleiro.reduce((parcial, item)=> parcial + Math.abs(item[0]) + Math.abs(item[1]) + Math.abs(item[2]), 0) == 0){
      jogada = {i:0, j:0, k:0, ponto:Infinity};
      self.postMessage({resultado:jogada});
      return;
   }
   for(let i=0; i<3; i++){
      for(let j=0; j<3; j++){
         for(let k=0; k<3; k++){
            let restantes = pecas[jogador][k][0] + pecas[jogador][k][1] + pecas[jogador][k][2];
            if(restantes > 0 && Math.abs(tabuleiro[i][j]) - 10 < k){// &&
            //(Math.sign(tabuleiro[i][j]) != Math.sign(jogador) || tabuleiro[i][j] == 0)){
               let tabuleiroAntigo = tabuleiro[i][j];
               tabuleiro[i][j] = jogador * (k + 10);
               let pecasAntigo = [...pecas[jogador][k]];
               for(let l=0; l<3; l++){
                     if(pecas[jogador][k][l] != 0) {
                           pecas[jogador][k][l] = 0;
                     break;
                  }
               }
               let ponto = minimax(tabuleiro, pecas, jogador, 0, false, profundidadeMaxima);
               console.log(i,j,k,ponto);
               if(ponto > melhorPonto) {
                  melhorPonto = ponto;
                  jogada = {i:i,j:j,k:k,ponto:ponto};
               }
               tabuleiro[i][j] = tabuleiroAntigo;
               pecas[jogador][k] = [...pecasAntigo];
            }
            progresso++;
            self.postMessage(progresso);
         }
      }
   }
   self.postMessage({resultado:jogada});
}


function minimax(tabuleiro, pecas, jogador, profundidade, maximiza, profundidadeMaxima){
   let resultado = checaVencedor(tabuleiro, pecas);
   if(resultado !== null) {
      //resultados++;
      // console.log(resultados);
      // console.log("-----");
      // console.log(tabuleiro[0][0], tabuleiro[1][0], tabuleiro[2][0]);
      // console.log(tabuleiro[0][1], tabuleiro[1][1], tabuleiro[2][1]);
      // console.log(tabuleiro[0][2], tabuleiro[1][2], tabuleiro[2][2]);
      // console.log("resultado:"+resultado);
      // console.log("profundidade:" + profundidade);
      if(resultado == 0) return 0;
      if(resultado == jogador){
         return 1000;
      } else {
         return -1000;
      }
   }
   if(profundidade > profundidadeMaxima) {
      let maiorPonto = -Infinity;
      let menorPonto = Infinity;
      for(let i = 0; i < 3; i++){
         let linha = tabuleiro[0][i] + tabuleiro[1][i] + tabuleiro[2][i];
         if(linha > maiorPonto) maiorPonto = linha;
         if(linha < menorPonto) menorPonto = linha;
         let coluna = tabuleiro[i][0] + tabuleiro[i][1] + tabuleiro[i][2];
         if(coluna > maiorPonto) maiorPonto = coluna;
         if(coluna < menorPonto) menorPonto = coluna;
      }
      let diagonalPrincipal = tabuleiro[0][0] + tabuleiro[1][1] + tabuleiro[2][2];
      if(diagonalPrincipal > maiorPonto) maiorPonto = diagonalPrincipal;
      if(diagonalPrincipal < menorPonto) menorPonto = diagonalPrincipal;
      let diagonalSecundaria = tabuleiro[0][2] + tabuleiro[1][1] + tabuleiro[2][0];
      if(diagonalSecundaria > maiorPonto) maiorPonto = diagonalSecundaria;
      if(diagonalSecundaria < menorPonto) menorPonto = diagonalSecundaria;
      // console.log("-----");
      // console.log(tabuleiro[0][0], tabuleiro[1][0], tabuleiro[2][0]);
      // console.log(tabuleiro[0][1], tabuleiro[1][1], tabuleiro[2][1]);
      // console.log(tabuleiro[0][2], tabuleiro[1][2], tabuleiro[2][2]);
      // console.log(jogador, profundidade, menorPonto, maiorPonto);
      if(jogador == 1) return maiorPonto;
      return menorPonto;
      
      // +10 +11 +00
      // -10 +00 +00  
      // -12 +00 +12
      // 1 4 -12 +22

      return 0;
   }
   if(maximiza){
      let melhorPonto = -Infinity;
      for(let i=0; i<3; i++){
         for(let j=0; j<3; j++){
            for(let k=0; k<3; k++){
               let restantes = pecas[jogador][k][0] + pecas[jogador][k][1] + pecas[jogador][k][2];
               if(restantes > 0 && Math.abs(tabuleiro[i][j]) - 10 < k){ //&&
               //(Math.sign(tabuleiro[i][j]) != Math.sign(jogador) || tabuleiro[i][j] == 0)){
                  let tabuleiroAntigo = tabuleiro[i][j];
                  tabuleiro[i][j] = jogador * (k + 10);
                  let pecasAntigo = [...pecas[jogador][k]];
                  for(let l=0; l<3; l++){
                     if(pecas[jogador][k][l] != 0) {
                        pecas[jogador][k][l] = 0;
                        break;
                     }
                  }   
                  //console.log(pecas[jogador][k][0],pecas[jogador][k][1],pecas[jogador][k][2]);
               
                  let ponto = minimax(tabuleiro, pecas, jogador, profundidade + 1, false, profundidadeMaxima) - profundidade;
                  //console.log(i,j,ponto);
                  tabuleiro[i][j] = tabuleiroAntigo;
                  pecas[jogador][k] = [...pecasAntigo];
                  if(ponto > melhorPonto){
                     melhorPonto = ponto;
                     jogada = {i:i,j:j,k:k};
                  }
               }
            }

                  
            // if(tabuleiro[i][j] == 0){
            //    tabuleiro[i][j] = ia;
            //    let ponto = minimax(tabuleiro, profundidade + 1, false) - profundidade;
            //    // console.log("max");
            //    // console.log("-----");
            //    // console.log(tabuleiro[0][0], tabuleiro[1][0], tabuleiro[2][0]);
            //    // console.log(tabuleiro[0][1], tabuleiro[1][1], tabuleiro[2][1]);
            //    // console.log(tabuleiro[0][2], tabuleiro[1][2], tabuleiro[2][2]);
            //    // console.log(ponto);
            //    tabuleiro[i][j] = 0;
            //    melhorPonto = Math.max(ponto, melhorPonto);
            // }
         }
      }
      return melhorPonto;   
   } else {
      let melhorPonto = Infinity;
      for(let i=0; i<3; i++){
         for(let j=0; j<3; j++){
            for(let k=0; k<3; k++){
               let restantes = pecas[-jogador][k][0] + pecas[-jogador][k][1] + pecas[-jogador][k][2];
               if(restantes > 0 && Math.abs(tabuleiro[i][j]) - 10 < k &&
               (Math.sign(tabuleiro[i][j]) == Math.sign(jogador) || tabuleiro[i][j] == 0)){
                  let tabuleiroAntigo = tabuleiro[i][j];
                  tabuleiro[i][j] = -jogador * (k + 10);
                  let pecasAntigo = [...pecas[-jogador][k]];
                  for(let l=0; l<3; l++){
                     if(pecas[-jogador][k][l] != 0) {
                        pecas[-jogador][k][l] = 0;
                        break;
                     }
                  }   
                  let ponto = minimax(tabuleiro, pecas, jogador, profundidade + 1, true, profundidadeMaxima) + profundidade;
                  //console.log(i,j,ponto);
                  tabuleiro[i][j] = tabuleiroAntigo;
                  pecas[-jogador][k] = [...pecasAntigo];
                  if(ponto < melhorPonto){
                     melhorPonto = ponto;
                     jogada = {i:i,j:j,k:k};
                  }
               }
            }
            
            // if(tabuleiro[i][j] == 0){
            //    tabuleiro[i][j] = -ia;
            //    let ponto = minimax(tabuleiro, profundidade + 1, true) + profundidade;
            //    // console.log("min");8wn 
            //    tabuleiro[i][j] = 0;
            //    melhorPonto = Math.min(ponto, melhorPonto);
            // }
         }
      }
      return melhorPonto;
   }
}

function checaVencedor(tabuleiro, pecas){
   // console.log("-----");
   // console.log(tabuleiro[0][0], tabuleiro[1][0], tabuleiro[2][0]);
   // console.log(tabuleiro[0][1], tabuleiro[1][1], tabuleiro[2][1]);
   // console.log(tabuleiro[0][2], tabuleiro[1][2], tabuleiro[2][2]);
   let vencedorTemp = null;
   let somaLinha = 0;
   for(let i = 0; i < 3; i++){
      let linha = tabuleiro[0][i] + tabuleiro[1][i] + tabuleiro[2][i];
      if(linha <= -30 || linha >= 30){
         vencedorTemp = Math.sign(tabuleiro[0][i]);
      }
      let coluna = tabuleiro[i][0] + tabuleiro[i][1] + tabuleiro[i][2];
      if(coluna <= -30 || coluna >= 30){
         vencedorTemp= Math.sign(tabuleiro[i][0]);
      }
      somaLinha += Math.abs(Math.sign(tabuleiro[0][i])) + Math.abs(Math.sign(tabuleiro[1][i])) + Math.abs(Math.sign(tabuleiro[2][i]));
   }
   let diagonalPrincipal = tabuleiro[0][0] + tabuleiro[1][1] + tabuleiro[2][2];
   if(diagonalPrincipal <= -30 || diagonalPrincipal >= 30){
      vencedorTemp = Math.sign(tabuleiro[0][0]);
   }
   let diagonalSecundaria = tabuleiro[0][2] + tabuleiro[1][1] + tabuleiro[2][0];
   if(diagonalSecundaria <= -30 || diagonalSecundaria >= 30){
      vencedorTemp = Math.sign(tabuleiro[0][2]);
   }
   let pecasRestantes = 0;
   for(k=0; k<3; k++) {
      for(l=0; l<3; l++){
         pecasRestantes += pecas[1][k][l];
         pecasRestantes += pecas[-1][k][l];
      }
   }
   if(vencedorTemp == null && (somaLinha == 9 || pecasRestantes == 0)) vencedorTemp = 0;
   return vencedorTemp;
}