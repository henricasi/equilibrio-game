const balanceCanvas = document.getElementById('balance-canvas');
const ctx = balanceCanvas.getContext('2d');

//setting font 
ctx.font = "60px Libre Baskerville";
ctx.textBaseline = "hanging";


// constants
const colorsArr = ['rgb(165,42,42)', 'rgb(255,88,76)', 'rgb(255,223,179)', 'rgb(255,176,115)', 'rgb(224,179,225)', 'rgb(255,84,142)', 'rgb(255,121,61)', 'rgb(255,91,87)', 'rgb(255,87,168)', 'rgb(255,242,104)', 'rgb(255,178,126)', 'rgb(255,78,55)'];
    // active area (right plate)
const xMin = 740;
const xMax = 920;
const xMiddle = 830;
const activeAreaMaxWidth = 180;
    // stage rules
const weightRulesStage0 = [
    {
        id: -1,
        mass: 0,
    },
    {
        id: 0,
        mass: 0,
    }
]
const weightRulesStage1 = [
    {
        id: -1,
        mass: 70,
    },
    {
        id: 0,
        mass: 10,
    },
    {   id: 1,
        mass: 16,
    },
    {
        id: 2,
        mass: 18,
    },
    {
        id: 3,
        mass: 16,
    },
    {
        id: 4,
        mass: 10,
    },
]
const weightRulesStage2 = [
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
        mass: 20,
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
]; 
const weightRulesStage3 = [
    {
        id: -1,
        mass: 70,
    },
    {
        id: 0,
        mass: 40,
    },
    {   id: 1,
        mass: 28,
    },
    {
        id: 2,
        mass: 20,
    },
    {
        id: 3,
        mass: 35,
    },
    {
        id: 4,
        mass: 12,
    },
    {
        id: 5,
        mass: 18,
    },
    {   id: 6,
        mass: 10,
    },
    {
        id: 7,
        mass: 14,
    },
    {
        id: 8,
        mass: 20,
    },
    {   id: 9,
        mass: 25,
    },
];
const weightRulesStage4 = [
    {
        id: -1,
        mass: 20,
    },
    {
        id: 0,
        mass: 33,
    },
    {   id: 1,
        mass: 15,
    },
    {
        id: 2,
        mass: 30,
    },
    {
        id: 3,
        mass: 10,
    },
    {
        id: 4,
        mass: 18,
    },
    {
        id: 5,
        mass: 30,
    },
    {   id: 6,
        mass: 15,
    },
    {
        id: 7,
        mass: 28,
    },
    {   id: 8,
        mass: 20,
    },
    {   id: 9,
        mass: 18,
    },
    {
        id: 10,
        mass: 28,
    },  
];
const weightRulesStage5 = [
    {
        id: -1,
        mass: 55,
    },
    {
        id: 0,
        mass: 10,
    },
    {   id: 1,
        mass: 13,
    },
    {
        id: 2,
        mass: 12,
    },
    {
        id: 3,
        mass: 34,
    },
    {
        id: 4,
        mass: 15,
    },
    {
        id: 5,
        mass: 20,
    },
];

// initializers
let scale = {};
let currentStage = 0;
let stageWon = false;
let currentStageWeightsArr = [];
let activeWeights = [];
let activeAreaRowsCurrentWidth = [0, 0, 0];
let activeAreaRowsFutureWidth = [0, 0, 0];


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


class Weight {
    constructor(rule, rulesLength) {
        this.color = chooseColor();
        this.mass = rule.mass;
        this.position = rule.id + 1;
        // randomize width and height
        const shapeWeight = () => {
            // width + height = this.mass*6
            let minWidth = this.mass*2;
            let maxWidth = this.mass*4;
            let randomWidth = Math.floor(Math.random() * (maxWidth - minWidth)) + minWidth;
            let randomHeight = this.mass*6 - randomWidth;
            return {width: randomWidth, height: randomHeight};
        }
        let dimensions = shapeWeight();
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
        if (this.position > 0 && !this.active  && !stageWon) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    

    updateWheelPosition() {
        if (!stageWon) {
            this.angleModifier += 0.001;
            this.angle = ((Math.PI*2/this.numOfPositions)*this.position)+this.angleModifier;
            this.x = (700 + 270 * Math.cos(this.angle)) - this.width/2;
            this.y = (280 + 270 * Math.sin(this.angle)) - this.width/2;
        }
    }
}



const updateActiveWeights = (weightsArr) => {
    // determine max height of active weights per row
    let activeWeightsHeights = [];
    activeWeights.forEach(weight => activeWeightsHeights.push({row: weight.row, height: weight.height}));

    let rowHeights = [0, 0, 0];
    if (activeWeights.length > 0) {
        let rowZeroHeights = [];
        let rowOneHeights = [];
        let rowTwoHeights = [];
        activeWeightsHeights.forEach(elem => {
            switch (elem.row) {
                case 0:
                    rowZeroHeights.push(elem.height);
                    break;
                case 1:
                    rowOneHeights.push(elem.height);
                    break;
                case 2:
                    rowTwoHeights.push(elem.height);
                    break;
            }
        })
        if (rowZeroHeights.length > 0) rowHeights[0] = rowZeroHeights.reduce((a,b) => Math.max(a,b));
        if (rowOneHeights.length > 0) rowHeights[1] = rowOneHeights.reduce((a,b) => Math.max(a,b));
        if (rowTwoHeights.length > 0) rowHeights[2] = rowTwoHeights.reduce((a,b) => Math.max(a,b));
    }
    
    // stores sum of previous widths for positioning next weight
    let previousWidths = [0, 0, 0];

    for (let i = 0; i < activeWeights.length; i += 1) {
        let yOffset = scale.massRight - scale.massLeft;
        switch (activeWeights[i].row) {
            case 0:
                ctx.fillStyle = activeWeights[i].color;
                ctx.fillRect(xMiddle - activeAreaRowsCurrentWidth[0]/2 + previousWidths[0], 350 + yOffset - activeWeights[i].height, activeWeights[i].width, activeWeights[i].height);
                break;
            case 1:
                ctx.fillStyle = activeWeights[i].color;
                ctx.fillRect(xMiddle - activeAreaRowsCurrentWidth[1]/2 + previousWidths[1], 350 + yOffset - activeWeights[i].height - rowHeights[0], activeWeights[i].width, activeWeights[i].height);
                break;
            case 2:
                ctx.fillStyle = activeWeights[i].color;
                ctx.fillRect(xMiddle - activeAreaRowsCurrentWidth[2]/2 + previousWidths[2], 350 + yOffset - activeWeights[i].height - rowHeights[0] - rowHeights[1], activeWeights[i].width, activeWeights[i].height);
                break;
        }
        // update previous widths
        switch (activeWeights[i].row) {
            case 0:
                previousWidths[0] += activeWeights[i].width;
                break;
            case 1:
                previousWidths[1] += activeWeights[i].width;
                break;
            case 2:
                previousWidths[2] += activeWeights[i].width;
                break;
        }
        
    }
    // end for loop
    previousWidthsRowOne = 0;
    previousWidthsRowTwo = 0;
    previousWidthsRowThree = 0;
}


class Scale {
    constructor(rulesArr) {
        this.massLeft = rulesArr[0].mass;
        this.massRight = 0;
        this.frames = 0;
    }

    drawBackground() {
        if (stageWon) {
            ctx.fillStyle = '#E2D3DE' // change this
            ctx.fillRect(0, 0, 1400, 700);
        } else {
            switch (currentStage) {
                case 0:
                    ctx.fillStyle = '#FAD7BB'
                    ctx.fillRect(0, 0, 1400, 700);
                    break;
                case 1:
                    ctx.fillStyle = '#9BBDFF'  //9BBDFF
                    ctx.fillRect(0, 0, 1400, 700);
                    break;
                case 2:
                    ctx.fillStyle = '#8BA9E5' // change this color
                    ctx.fillRect(0, 0, 1400, 700);
                    break;
                case 3:
                    ctx.fillStyle = '#748DBF' // change this color
                    ctx.fillRect(0, 0, 1400, 700);
                    break;
                case 4:
                    ctx.fillStyle = '#7A87C9' // change this color
                    ctx.fillRect(0, 0, 1400, 700);
                    break;
                case 5:
                    ctx.fillStyle = '#5B72E5' // change this color
                    ctx.fillRect(0, 0, 1400, 700);
                    break;
                case 6:

                    //draw play again?
                    ctx.fillStyle = '#74A4FF' // change color!!
                    ctx.fillRect(0, 0, 1400, 700);

            }
        }
    }

    drawTitle() {
        if (currentStage === 0) {
            const title = ['e','q','u','i','l','i','b','r','i','o'];
            ctx.font = "60px Libre Baskerville";
            ctx.fillStyle = "#3E4E50";
            for (let i = 0; i < 10; i += 1) {
                let x = 290 + 80*i;
                let y = 355 - 30*i;
                ctx.fillText(title[i], x, y);
            }
            ctx.font = "20px Libre Baskerville";
            ctx.fillStyle = "#959E9F"; // shade of gray here
            ctx.fillText("c l i c k   a n y w h e r e   t o   b e g i n", 505, 630);
        } else if (currentStage === 6) {
            //draw title balanced
            ctx.font = "60px Libre Baskerville";
            ctx.textBaseline = "hanging";
            ctx.fillStyle = "#3E4E50";
            ctx.fillText("e  q  u  i  l  i  b  r  i  o", 390, 300);
        }
    }

    drawScale() {
        if (currentStage > 0) {
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
        }
    }

    clearCanvas() {
        ctx.clearRect(0, 0, balanceCanvas.width, balanceCanvas.height);
    }

    start() {
        updateGame();
    }

}



class Yogi {
    constructor() {
        this.head = new Image();
        this.head.src = "./images/yogihead.png"
        this.body = new Image();
        this.body.src = "./images/yogi.png"
        this.hand = new Image();
        this.hand.src = "./images/okhand.png"
        this.happy = new Image();
        this.happy.src = "./images/happy.png"
    }

    // drawNextStageHand() {
    //     if (stageWon) {
    //         ctx.drawImage(this.hand, 960, 100, 500, 800);
    //     }
    // }
    
    drawYogi() {
        if (stageWon) {
            ctx.drawImage(this.happy, 455, 285, 500, 500);
        } else {
            switch (currentStage) {
                case 0:
                    ctx.drawImage(this.body, 440, 150, 500, 500)
                    break;
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    ctx.drawImage(this.head, 0, 0, this.head.width, this.head.height - 90);
                    break;
                case 6:
                    ctx.drawImage(this.happy, 455, 285, 500, 500);
                    break;
            }
        }
    }

    drawYogiExpression() {
        let yOffset = scale.massRight - scale.massLeft;
        if (!stageWon) {
            if (yOffset < 0) {
                yOffset *= -1;
            }
            if (yOffset > 40) {
                // frustrated
            } else if (yOffset > 20) {
                // concentrated
            } else {
                // almost there!
            }
        }
    }
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
        if (hasSameColor(color, weight) && weight.position !== 0 && !stageWon) {
            console.log('click on weight: ' + weight.position);
            weight.active = !weight.active;
            // add to right plate rows
            if (weight.active) {
                scale.massRight += weight.mass;
                switch (weight.row) {
                    case 0:
                        activeAreaRowsFutureWidth[0] = activeAreaRowsCurrentWidth[0] + weight.width;
                        if (activeAreaRowsFutureWidth[0] > activeAreaMaxWidth) {
                            weight.row +=1;
                            activeAreaRowsFutureWidth[1] = activeAreaRowsCurrentWidth[1] + weight.width;
                            if (activeAreaRowsFutureWidth[1] > activeAreaMaxWidth) {
                                weight.row +=1;
                                activeAreaRowsCurrentWidth[2] += weight.width;
                            } else {
                                activeAreaRowsCurrentWidth[1] += weight.width;
                            }
                        } else {
                            activeAreaRowsCurrentWidth[0] += weight.width;
                        }
                        break;
                    case 1:
                        activeAreaRowsFutureWidth[1] = activeAreaRowsCurrentWidth[1] + weight.width;
                        if (activeAreaRowsFutureWidth[1] > activeAreaMaxWidth) {
                                weight.row +=1;
                                activeAreaRowsCurrentWidth[2] += weight.width;
                        } else {
                            activeAreaRowsCurrentWidth[1] += weight.width;
                        }
                        break;
                    case 2:
                        activeAreaRowsCurrentWidth[2] += weight.width;
                        break;
                }
                // add to active array
                activeWeights.push(weight);

            } else { // if after click weight.active = false
                scale.massRight -= weight.mass;
                let weightRow = weight.row;
                activeAreaRowsCurrentWidth[weightRow] -= weight.width;
                // reset row property
                weight.row = 0;
                // remove from active array
                activeWeights = activeWeights.filter(elem => elem.position !== weight.position);
            }
        }
    });

    if (currentStage === 0) {
        nextStage();
        // stageWon = true;
    }
    
    if (stageWon && currentStage < 6) {
        nextStage();
    }

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

let yogi = new Yogi;

const startGame = () => {
    createScale(weightRulesStage0);
    createWeights(weightRulesStage0);
    scale.start();
}

const nextStage = () => {
    scale = {};
    currentStageWeightsArr = [];
    activeWeights = [];
    activeAreaRowsCurrentWidth = [0, 0, 0];
    activeAreaRowsFutureWidth = [0, 0, 0];
    currentStage += 1;
    stageWon = false;
    switch (currentStage) {
        case 1:
            createScale(weightRulesStage1);
            createWeights(weightRulesStage1);
            break;
        case 2:
            createScale(weightRulesStage2);
            createWeights(weightRulesStage2);
            break;
        case 3:
            createScale(weightRulesStage3);
            createWeights(weightRulesStage3);
            break;
        case 4:
            createScale(weightRulesStage4);
            createWeights(weightRulesStage4);
            break;
        case 5:
            createScale(weightRulesStage5);
            createWeights(weightRulesStage5);
            break;
    }
    // fix first weight color DO I KEEP THIS?
    currentStageWeightsArr[0].color = '#B24747';   
}



const checkIfWin = () => {
    if (scale.massLeft === scale.massRight && currentStage > 0) {
        stageWon = true;
    }
}

let canvasAnimation;

// my engine; called by requestAnimationFrame
const updateGame = () => {
    scale.frames += 1;
    // clears canvas
    scale.clearCanvas();
    // draws background
    scale.drawBackground();
    yogi.drawYogi();
    scale.drawTitle();
    yogi.drawYogiExpression();
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

// ALGUM LUGAR TEM QUE CHAMAR
// cancelAnimationFrame(canvasAnimation);
