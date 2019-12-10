const balanceCanvas = document.getElementById('balance-canvas');
const ctx = balanceCanvas.getContext('2d');

// constants
const colorsArr = ['rgb(165,42,42)', 'rgb(255,215,0)', 'rgb(255,223,179)', 'rgb(255,176,115)', 'rgb(224,179,225)', 'rgb(255,84,142)', 'rgb(255,121,61)', 'rgb(255,91,87)', 'rgb(255,87,168)', 'rgb(255,242,104)', 'rgb(255,178,126)', 'rgb(255,78,55)'];

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
        this.position = rule.id;

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
        // calculate x and y for circunference positioning
        this.x = (700 + 310 * Math.cos(this.angle)) - this.width/2;
        this.y = (280 + 310 * Math.sin(this.angle)) - this.width/2;
        // determine if weight is active or inactive
        this.active = false;
    }


    updateInactiveWeight() {
        //do this for each element of weights array
        if (this.position >= 0 && !this.active) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }  
    }

    updateActiveWeight() {
        // scale.massRight += this.mass (será isso?)
        if (this.position >= 0 && !this.active) {
            // aqui preciso do código dos 
        }
    }

    updateWheelPosition() {
        // updates this.angle; should be called for all objects
        let finalAngleMultiplier = 0;

        finalAngleMultiplier += 0.001;
        // i have to update this.x before redrawing



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
        if (hasSameColor(color, weight)) {
            console.log('click on weight: ' + weight.position);
            weight.state = !weight.state;
        }
    });
 });

// END HIT AREA CODE

class Scale {
    constructor(rulesArr) {
        this.massLeft = rulesArr[0].mass;
        this.massRight = 0;
    }

    drawScale() {
        // calculate weight imbalance
        let yOffset = this.massRight - this.massLeft;

        // background
        ctx.fillStyle = '#74A4FF'
        ctx.fillRect(0, 0, 1400, 700);

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
        ctx.strokeStyle = 'lightgray';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(700, 280, 310, 0, Math.PI*2);
        ctx.stroke()
    }
}



class Monk {

}


// ADICIONAR OBJETO À BALANÇA:
    // se objeto ativo, não desenha no rol de inativos
    // quando ativo, desenha no rol de ativos

    // preciso criar fileiras sobre o prato direito
    // delimitar x mínimo e x máximo de cada fileira; se exceder x máx, desenhar em cima


const createScale = (weightRulesArr) => {
    scale = new Scale(weightRulesArr)
}

// const createWeights = (weightRulesArr) => {
//     for (let i = 0; i < weightRulesArr.length; i += 1) {
//         currentStageWeightsArr.push(new Weight(weightRulesArr[i].id, weightRulesArr.length, weightRulesArr[i].mass));
//     }
// }


const createWeights = (weightRulesArr) => {
    weightRulesArr.forEach(rule => {
        currentStageWeightsArr.push(new Weight(rule, weightRulesArr.length));
    })
}


const checkIfWin = () => {
    if (scale.massLeft = scale.massRight) {

    }
    // if win, clears interval
    
    // if goes to next stage, resets scale
    scale = {};

}

// TESTS
createScale(weightRulesStage1);
createWeights(weightRulesStage1);

console.log(currentStageWeightsArr);


// fix left weight color
currentStageWeightsArr[0].color = 'rgb(225,128,43)';

scale.drawScale();

currentStageWeightsArr.forEach(weight => {
    weight.updateInactiveWeight();
})
// END TESTS

const startGame = () => {
    
}

// my engine; called by setInterval
const updateGame = () => {
    // clears canvas
    // draws background (SEPARATE FROM SCALE)
    // draws active weights
    currentStageWeightsArr.forEach(weight => {
        weight.updateActiveWeight();
    })
    // draws the scale
    scale.drawScale();
    // draws inactive weights
    currentStageWeightsArr.forEach(weight => {
        weight.updateInactiveWeight();
    })
    // checks if balance was achieved
}