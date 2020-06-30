/**
 * @description: 生成分享海报
 * @json {Array} 
 * @return: String
 */

function canvas2Img (json, callback) {
  // 创建canvas对象
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  // 初始化canvas的宽高度
  canvas.width = json.width
  canvas.height = json.height
  canvasReact({ backgroundColor: '#fff', left: 0, top: 0, width: json.width, height: json.height }, ctx)
  canvasAll(json.views, 0, ctx, function () {
    canvasTimg(canvas, json.quality, function (res) {
      callback(res)
    })
  })
}

/**
 * @description: 画图递归回调，抛出最后一次回调
 * @param {type} 
 * @return: 
 */
function canvasAll (views, index, ctx, callback) {
  if (!views[index]) {
    callback()
    return
  }
  switch (views[index].type) {
    case 'image':
      canvasImage(views[index], ctx, function () {
        console.log(index, views[index].type + '画完了')
        canvasAll(views, ++index, ctx, callback)
      })
      break
    case 'text':
      canvasText(views[index], ctx, function () {
        console.log(index, views[index].type + '画完了')
        canvasAll(views, ++index, ctx, callback)
      })
      break
  }
}

/**
 * @description: 画方形 eg: 填充背景
 * @param {type} 
 * @return: 
 */
function canvasReact (item, ctx, callback) {
  ctx.fillStyle = item.backgroundColor || '#f0f'
  ctx.fillRect(item.left, item.top, item.width, item.height);
  callback ? callback() : ''
}

/**
 * @description: 将图片放在canvas对应位置
 * @item {Object}
 * @canvas {DOM}
 * @return: null
 */
function canvasImage (item, ctx, callback) {
  var img = new Image()
  img.src = item.src
  img.setAttribute('crossOrigin', 'Anonymous')
  img.onload = function () {
    ctx.drawImage(img, item.left, item.top, item.width, item.height)
    callback ? callback() : ''
  }
}

/**
 * @description: 将文字放在canvas对应位置
 * @item {Object}
 * @canvas {DOM}
 * @return: null
 */
function canvasText (item, ctx, callback) {
  ctx.fillStyle = item.color
  ctx.font = (item.fontSize || 12) + 'px ' + (item.fontFamily || 'Microsoft YaHei');
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  var txtArr = returnCanvasTextArr(item, ctx)
  var maxLineNumber = item.maxLineNumber || 2
  if (txtArr.length > maxLineNumber) {
    var _len = txtArr[maxLineNumber - 1].length
    txtArr[maxLineNumber - 1] = txtArr[maxLineNumber - 1].slice(0, _len - 1) + '...'
  }
  txtArr.every((conTxt, index) => {
    if (index >= maxLineNumber) {
      return false
    }
    ctx.fillText(conTxt, item.left, item.top + index * item.lineHeight)
    callback ? callback() : ''
    return true
  });
}

/**
 * @description: 返回字符串需要的行
 * @item {Object}
 * @return: Array
 */
function returnCanvasTextArr (item, ctx) {
  var arr = []
  var lastIndex = 0
  if (ctx.measureText(item.content).width <= item.width) {
    arr.push(item.content)
  } else {
    for (var index = 1; index < item.content.length; index++) {
      if (ctx.measureText(item.content.slice(lastIndex, index)).width - item.width >= 0) {
        arr.push(item.content.slice(lastIndex, index))
        lastIndex = index
      }
    }
    arr.push(item.content.slice(lastIndex, item.content.length))
  }

  return arr.filter(function (s) {
    return s && s.trim();
  })
}

/**
 * @description: 将canvas转换为图片
 * @canvas {DOM} canvas对象
 * @callback {function} 成功回调函数
 * @return: base64
 */
function canvasTimg (canvas, quality, callback) {
  callback(canvas.toDataURL('image/jpeg', quality || 1.0))
}