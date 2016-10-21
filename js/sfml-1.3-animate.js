---
---

document.addEventListener('DOMContentLoaded', startEndlessAnimation)

var BLOCK_FIRST = 1
var BLOCK_LAST = 6
var ANIMATION_TIMEOUT = 40

function lerp (fromValue, toValue, ratio) {
  return (toValue - fromValue) * ratio + fromValue
}

var g_animations = [
  {
    'funcs': [moveBy],
    'times': 40,
    'args': {'x': 200, 'y': 0}
  },
  {
    'funcs': [moveBy, changeOpacity],
    'times': 40,
    'args': {'x': 200, 'y': 200, 'opacity': 0.5}
  },
  {
    'funcs': [swapXY],
    'times': 40,
    'args': {}
  },
  {
    'funcs': [moveBy, resizeTo],
    'times': 40,
    'args': {'x': 0, 'y': -200, 'width': 50, 'height': 20}
  },
  {
    'funcs': [swapXY],
    'times': 40,
    'args': {}
  },
  {
    'funcs': [moveBy, changeOpacity],
    'times': 40,
    'args': {'x': -200, 'y': -200, 'opacity': 1.0}
  },
  {
    'funcs': [moveBy, resizeTo],
    'times': 40,
    'args': {'x': 200, 'y': 0, 'width': 50, 'height': 50}
  },
  {
    'funcs': [moveBy, changeOpacity],
    'times': 40,
    'args': {'x': 200, 'y': 200, 'opacity': 0.5}
  },
  {
    'funcs': [moveBy],
    'times': 40,
    'args': {'x': -200, 'y': 0}
  },
  {
    'funcs': [moveBy, changeOpacity],
    'times': 40,
    'args': {'x': -200, 'y': -200, 'opacity': 1.0}
  },
]

var g_blocks = []
var g_currentAnimation = 0
var g_currentStep = 0

function resetBlocksData () {
  for (var i = 0; i < g_blocks.length; ++i) {
    var block = g_blocks[i]
    block.data = new Array()
  }
}

// Expects 'x', 'y' in args
function moveBy (block, args, times) {
  var state = block.data
  if (g_currentStep === 0) {
    style = getComputedStyle(block)
    state['startX'] = parseInt(style.left, 10)
    state['startY'] = parseInt(style.top, 10)
  }
  var phase = (g_currentStep + 1)  / times
  var left = lerp(state['startX'], state['startX'] + args.x, phase)
  var top = lerp(state['startY'], state['startY'] + args.y, phase)
  block.style.left = left + 'px'
  block.style.top = top + 'px'
}

// Doesn't need args
function swapXY (block, args, times) {
  var state = block.data
  if (g_currentStep === 0) {
    style = getComputedStyle(block)
    state['startX'] = parseInt(style.left, 10)
    state['startY'] = parseInt(style.top, 10)
  }
  var phase = (g_currentStep + 1)  / times
  var left = lerp(state['startX'], state['startY'], phase)
  var top = lerp(state['startY'], state['startX'], phase)
  block.style.left = left + 'px'
  block.style.top = top + 'px'
}

// Expects 'opacity' in args
function changeOpacity (block, args, times) {
  var state = block.data
  if (g_currentStep === 0) {
    style = getComputedStyle(block)
    state['startOpacity'] = parseFloat(style.opacity, 10)
  }
  var fromOpacity = state['startOpacity']
  var phase = (g_currentStep + 1)  / times
  var opacity = lerp(fromOpacity, args.opacity, phase)
  block.style.opacity = opacity
}

// Expects 'width', 'height' in args
function resizeTo (block, args, times) {
  var state = block.data
  if (g_currentStep === 0) {
    style = getComputedStyle(block)
    state['startWidth'] = parseInt(style.width, 10)
    state['startHeight'] = parseInt(style.height, 10)
  }
  var phase = (g_currentStep + 1)  / times
  var width = lerp(state['startWidth'], args.width, phase)
  var height = lerp(state['startHeight'], args.height, phase)
  block.style.width = width + 'px'
  block.style.height = height + 'px'
}

// returns true if animation not ended, false otherwise.
function playAnimation () {
  var animation = g_animations[g_currentAnimation]
  for (var blockIndex = 0; blockIndex < g_blocks.length; ++blockIndex) {
    for (var funcIndex = 0; funcIndex < animation.funcs.length; ++funcIndex) {
      var func = animation.funcs[funcIndex]
      var block = g_blocks[blockIndex]
      func(block, animation.args, animation.times)
    }
  }
  g_currentStep += 1;
  return (g_currentStep < animation.times);
}

function switchAnimation () {
  resetBlocksData()
  g_currentStep = 0
  g_currentAnimation = (g_currentAnimation + 1) % g_animations.length
}

function doEndlessAnimation () {
  if (!playAnimation()) {
    switchAnimation()
  }
  setTimeout(doEndlessAnimation, ANIMATION_TIMEOUT)
}

function startEndlessAnimation () {
  for (var i = BLOCK_FIRST; i <= BLOCK_LAST; ++i) {
    g_blocks.push(document.getElementById('block' + i.toString()))
  }
  resetBlocksData()
  doEndlessAnimation()
}
