const balanceCanvas = document.getElementById('balance-canvas');
const ctx = balanceCanvas.getContext('2d');

// constants
const colorsArr = ['rgb(165,42,42)', 'rgb(255,215,0)', 'rgb(255,223,179)', 'rgb(255,176,115)', 'rgb(224,179,225)', 'rgb(255,84,142)', 'rgb(255,121,61)', 'rgb(255,91,87)', 'rgb(255,87,168)', 'rgb(255,242,104)', 'rgb(255,178,126)', 'rgb(255,78,55)'];
    // active area (right plate)
const xMin = 750;
const xMax = 910;
const xMiddle = 830;
const activeAreaMaxWidth = 160;
// ZERAR ISSO ao começar nova fase
let activeAreaCurrentWidth = 0;




// initializers
let scale = {};
let currentStageWeightsArr = [];

// select random color
const chooseColor = () => {
    let randomInt = Math.floor(Math.random()*colorsArr.length);
    let newColor = colorsArr[randomInt];
    currentStageWeightsArr.forEach(weight => {
        if (weight.color !== newColor) {
            return newColor;
        } else {
            newColor = chooseColor();
            return newColor;
        }
    })
    return newColor;
}

// weight id: -1 goes to left plate, id: 0 onwards are added to inactive weights

let weightRulesStage1 = [
    {
        id: -1,
        mass: 60,
    },
    {
        id: 0,
        mass: 35,
    },
    {   id: 1,
        mass: 20,
    },
    {
        id: 2,
        mass: 15,
    },
    {
        id: 3,
        mass: 28,
    },
    {
        id: 4,
        mass: 15,
    },
    {
        id: 5,
        mass: 20,
    },
    {   id: 6,
        mass: 10,
    },
]
let weightRulesStage2 = []; 
let weightRulesStage3 = []; // complete later


// inactive weights circunference:
//          x     y   r    a0    a1
// ctx.arc(700, 280, 310, 0, Math.PI*2);


class Weight {
    constructor(rule, rulesLength) {
        // aqui eu quero que o parametro seja só um array? e as propriedades vão pegando dados dos objs?
        this.color = chooseColor();
        this.mass = rule.mass;
        this.position = rule.id + 1;

        const shapeWeight = () => {
            // width + height = this.mass*6
            let minWidth = this.mass*2;
            let maxWidth = this.mass*4;
            let randomWidth = Math.floor(Math.random() * (maxWidth - minWidth)) + minWidth;
            let randomHeight = this.mass*6 - randomWidth;
            return {width: randomWidth, height: randomHeight};
        }

        let dimensions = shapeWeight();
        console.log(dimensions);
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.numOfPositions = rulesLength - 1;
        this.angle = (Math.PI*2/this.numOfPositions)*this.position;
        this.angleModifier = 2;
        // calculate x and y for circunference positioning
        this.x = (700 + 270 * Math.cos(this.angle)) - this.width/2;
        this.y = (280 + 270 * Math.sin(this.angle)) - this.width/2;
        // determine if weight is active or inactive
        this.active = false;
        // determine to which row of active weights this belongs
        this.row = 0;
    }


    updateInactiveWeight() {
        //do this for each element of weights array
        if (this.position > 0 && !this.active) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    

    updateWheelPosition() {
        if (this.angleModifier === 2) {
            this.angleModifier = 0;
            this.angle = ((Math.PI*2/this.numOfPositions)*this.position)+this.angleModifier;
        } else {
            this.angleModifier += 0.001;
            this.angle = ((Math.PI*2/this.numOfPositions)*this.position)+this.angleModifier;
        }
        this.x = (700 + 270 * Math.cos(this.angle)) - this.width/2;
        this.y = (280 + 270 * Math.sin(this.angle)) - this.width/2;
    }
}

const updateActiveWeights = (weightsArr) => {
    // create array with active weights only
    let activeWeights = weightsArr.filter(weight => weight.active)
    // determine max height of active weights
    let activeWeightsHeights = [];
    activeWeights.forEach(weight => activeWeightsHeights.push(weight.height));
    let activeMaxHeight;
    if (activeWeights.length > 0) {
        activeMaxHeight = activeWeightsHeights.reduce((a,b) => Math.max(a,b));
    }
    
    // stores sum of previous widths for positioning next weight
    let previousWidths = 0;

    for (let i = 0; i < activeWeights.length; i += 1) {
        let yOffset = scale.massRight - scale.massLeft;
        if (i === 0) {
            ctx.fillStyle = activeWeights[i].color;
            ctx.fillRect(xMiddle - activeAreaCurrentWidth/2, 350 + yOffset -activeWeights[i].height, activeWeights[i].width, activeWeights[i].height);    
        } else {
            ctx.fillStyle = activeWeights[i].color;
            ctx.fillRect(xMiddle - activeAreaCurrentWidth/2 + previousWidths,350 + yOffset - activeWeights[i].height, activeWeights[i].width,activeWeights[i].height);
        }
        // update previous widths
        previousWidths += activeWeights[i].width;
    }
    
}


class Scale {
    constructor(rulesArr) {
        this.massLeft = rulesArr[0].mass;
        this.massRight = 0;
        this.frames = 0;
    }

    drawBackground() {
        ctx.fillStyle = '#74A4FF'
        ctx.fillRect(0, 0, 1400, 700);
    }

    drawScale() {
        // calculate weight imbalance
        let yOffset = this.massRight - this.massLeft;

        // left plate weight (determined at stage beginning)
        let leftWeight = currentStageWeightsArr[0];
        ctx.fillStyle = leftWeight.color;
        ctx.fillRect(570 - leftWeight.width/2, 350 - yOffset - leftWeight.height, leftWeight.width, leftWeight.height);

        // superior base
        ctx.fillStyle = '#856A94';
        ctx.lineCap = 'round';
        ctx.fillRect(680, 105, 40, 10);
        
        // descending line
        ctx.strokeStyle = '#856A94';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(700, 110);
        ctx.lineTo(700, 220);
        ctx.stroke();

        // main axis (MUTABLE) 
            // balance y = 220
        ctx.strokeStyle = '#FABD4F';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(570, 220 - yOffset);
        ctx.lineTo(830, 220 + yOffset);
        ctx.stroke();

        // plate chains (MUTABLE)
        ctx.strokeStyle = '#FBE08F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(570, 220 - yOffset);
        ctx.lineTo(630, 350 - yOffset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(570, 220 - yOffset);
        ctx.lineTo(510, 350 - yOffset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(830, 220 + yOffset);
        ctx.lineTo(770, 350 + yOffset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(830, 220 + yOffset);
        ctx.lineTo(890, 350 + yOffset);
        ctx.stroke();

        // nodes
        ctx.fillStyle = '#FABD4F';
        ctx.beginPath();
        ctx.arc(700, 220, 5, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = '#FABD4F';
        ctx.beginPath();
        ctx.arc(570, 220 - yOffset, 4, 0, Math.PI*2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(830, 220 + yOffset, 4, 0, Math.PI*2);
        ctx.fill();

        // plates (MUTABLE)
        ctx.strokeStyle = '#6047CC';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(510, 350 - yOffset);
        ctx.lineTo(630, 350 - yOffset);
        ctx.stroke();

        ctx.strokeStyle = '#6047CC';
        ctx.beginPath();
        ctx.moveTo(770, 350 + yOffset);
        ctx.lineTo(890, 350 + yOffset);
        ctx.stroke();

        // weights arc (for visibility only)
        // ctx.strokeStyle = 'lightgray';
        // ctx.lineWidth = 1;
        // ctx.beginPath();
        // ctx.arc(700, 280, 310, 0, Math.PI*2);
        // ctx.stroke()
    }

    clearCanvas() {
        ctx.clearRect(0, 0, balanceCanvas.width, balanceCanvas.height);
    }

    start() {
        updateGame();
    }

}



class Monk {

}

// START HIT AREA CODE

const hasSameColor = (color, weight) => weight.color === color;
  
balanceCanvas.addEventListener('click', (e) => {
    const mousePos = {
        x: e.clientX - balanceCanvas.offsetLeft,
        y: e.clientY - balanceCanvas.offsetTop
    };
    // get pixel under cursor
    const pixel = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
    
    // create rgb color for that pixel
    const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;

    // find a weight with the same colour
    currentStageWeightsArr.forEach(weight => {
        if (hasSameColor(color, weight) && weight.position !== 0) {
            console.log('click on weight: ' + weight.position);
            weight.active = !weight.active;
            if (weight.active) {
                scale.massRight += weight.mass;
                activeAreaCurrentWidth += weight.width;
            } else {
                scale.massRight -= weight.mass;
                activeAreaCurrentWidth -= weight.width;
            }
            
        }
    });
 });

// END HIT AREA CODE


const createScale = (weightRulesArr) => {
    scale = new Scale(weightRulesArr);
}


const createWeights = (weightRulesArr) => {
    weightRulesArr.forEach(rule => {
        currentStageWeightsArr.push(new Weight(rule, weightRulesArr.length));
    })
}




// TESTS


// END TESTS

const startGame = () => {
    createScale(weightRulesStage1);
    createWeights(weightRulesStage1);
    // fix first weight color
    currentStageWeightsArr[0].color = 'rgb(225,128,43)';
    scale.start();
}

const checkIfWin = () => {
    if (scale.massLeft === scale.massRight) {
        console.log('this is wrong!')
        cancelAnimationFrame(canvasAnimation);
        scale = {};
        currentStageWeightsArr = [];
    }
    // if win, clears interval
    // clearInterval(scale.interval);
    // if goes to next stage, resets scale and weights array

}

// let requestId;
// // LOOP CONTROL Object
// const loopControl = {
//   start() {
//     if (!requestId) {
//       requestId = window.requestAnimationFrame(update);
//       // return requestId;
//     }
//   },

//   stop() {
//     if (requestId) {
//       console.log('hello, stop');
//       window.cancelAnimationFrame(requestId);
//       requestId = undefined;
//     }
//   },

//   clear() {
//     ctx.clearRect(0, 0, balanceCanvas.width, balanceCanvas.height);
//   }
// };

// const update = (runtime) => {
//   requestId = undefined;
//   loopControl.clear();
//   console.log(runtime); // log in each frame for how long the game is running in milliseconds

//   // call loopControl.start() or loopControl.stop() in the end
//   loopControl.start();
// }


let canvasAnimation;

// my engine; called by requestAnimationFrame
const updateGame = () => {
    scale.frames += 1;
    // clears canvas
    scale.clearCanvas();
    // draws background (SEPARATE FROM SCALE)
    scale.drawBackground();
    // draws active weights
    
    updateActiveWeights(currentStageWeightsArr);
    // draws the scale
    scale.drawScale();
    // draws inactive weights
    
    currentStageWeightsArr.forEach(weight => {
        weight.updateWheelPosition();
        weight.updateInactiveWeight();
    })
    // checks if balance was achieved
    checkIfWin();
    canvasAnimation = requestAnimationFrame(updateGame);
}

startGame();