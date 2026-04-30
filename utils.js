const ctx = canvas.getContext("2d")

const W = canvas.width
const H = canvas.height

const BG = "lightgray"
const FG = "green"

const XMIN = -1
const XMAX = 1

const YMIN = -1
const YMAX = 1

function desenharFundo(cor=BG){
  ctx.fillStyle = cor
  ctx.fillRect(0, 0, W, H)
}

function mapearCoordenadas({x, y}){
  return {
    x: ((x + 1) / 2) * W,
    y: (1 - (y + 1) / 2) * H
  }
}

function mapearDistancia(d){
  return d / 2 * W
}

function desenharPonto({x, y}, cor=FG, r=5){
  ctx.lineWidth = r
  ctx.strokeStyle = cor
  ctx.beginPath()
  ctx.arc(x, y, 1, 0, Math.PI * 2)
  ctx.stroke()
}

function desenharLinha(pi, pf, cor=FG, linha=2){
  ctx.lineWidth = linha
  ctx.strokeStyle = cor
  ctx.beginPath()
  ctx.moveTo(pi.x,pi.y)
  ctx.lineTo(pf.x, pf.y)
  ctx.stroke()
}

function desenharPoligono(pontos, cor=FG, linha=2){
  ctx.lineWidth = linha
  ctx.strokeStyle = cor
  ctx.beginPath()

  ctx.moveTo(pontos[0].x, pontos[0].y)
  for(let i=1; i<pontos.length; i++)
    ctx.lineTo(pontos[i].x, pontos[i].y)
  ctx.closePath()

  ctx.stroke()
}

function desenhar(pontos, cor=FG, linha=2){
  const ps = pontos.map(mapearCoordenadas)
  ps.map((ponto) => desenharPonto(ponto, cor, linha))
  desenharPoligono(ps, cor, linha)
}

function transformaPonto({x, y}, m){
  return {
    x: x * m[0][0] + y * m[0][1] + m[0][2],
    y: x * m[1][0] + y * m[1][1] + m[1][2]
  }
}

function matrizParaEscalar(fx, fy){
  return [
    [fx, 0, 0],
    [0, fy, 0],
    [0, 0,  1]
  ]
}

function matrizDeTranslacao(tx,ty){
  return [
    [1, 0, tx],
    [0, 1, ty],
    [0, 0,  1]
  ]
}

function matrizDeRotacao(angulo){
  const cos = Math.cos(angulo)
  const sin = Math.sin(angulo)

  return [
    [cos, -sin, 0],
    [sin, cos,  0],
    [0,     0,  1]
  ]
}

function desenhaQuadriculado(celula, cor=BG, linha=1){
  for(let i=XMIN; i<=XMAX; i += celula){
    desenharLinha(
      mapearCoordenadas({x:i, y:YMAX}),
      mapearCoordenadas({x:i, y:YMIN}),
      cor, linha)
    desenharLinha(
      mapearCoordenadas({x:XMAX, y:i}),
      mapearCoordenadas({x:XMIN, y:i}),
      cor, linha)
  }
}

function rayCasting(poligono, ponto){
  let dentro = false
  const n = poligono.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poligono[i].x
    const yi = poligono[i].y
    const xj = poligono[j].x
    const yj = poligono[j].y

    const intersecta = ((yi > ponto.y) !== (yj > ponto.y)) &&
                       (ponto.x < (xj - xi) * (ponto.y - yi) / (yj - yi) + xi)

    if (intersecta)
      dentro = !dentro
  }

  // esta é a parte nova
  const zs = []
  for(const ponto of poligono)
    zs.push(ponto.z)

  return {
    x: ponto.x,
    y: ponto.y,
    z: Math.min(...zs), // junto com esta
    dentro: dentro
  }
}

function procuraCentros(celula){
  const centros = []
  //percorre cada celula nas colunas da matriz - eixo horizontal
  for(let x=XMIN+celula/2; x<=XMAX; x += celula)
    //percorre cada celula nas linhas da matriz - eixo vertical
    for(let y=YMIN+celula/2; y<=YMAX; y += celula){
      centros.push({x:x, y:y})
  }
  return centros
}

function desenhaQuadradoPeloCentro({x, y}, lado, cor=FG){
  ctx.fillStyle = cor
  ctx.fillRect((x-lado/2), (y - lado/2), lado, lado)
  ctx.stroke()
}

//o que tiver menor profundidade, é desenhado na frente
function criarImagem(centros, rcs, cores){
  // cópia inicial com profundidade com valor máximo
  let imagem = centros.slice()
  for(const pixel of imagem){
    pixel.cor = BG
    pixel.z = Number.MAX_VALUE
  }

  // atualização para cada pixel que encontrarmos
  rcs.forEach((rc, pos) => {
    rc.forEach((ponto, i) => {
      if(ponto.dentro && ponto.z < imagem[i].z){
        imagem[i].cor = cores[pos]
        imagem[i].z = ponto.z
      }
    })
  })

  return imagem
}
