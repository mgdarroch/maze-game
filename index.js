const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 14;
const cellsVertical = 12;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;
const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width: width,
        height: height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine)

// Walls

const walls = [
    Bodies.rectangle(width / 2, 0, width, 10, {isStatic: true,}),
    Bodies.rectangle(width / 2, height, width, 10, {isStatic: true}),
    Bodies.rectangle(0, height / 2, 10, height, {isStatic: true}),
    Bodies.rectangle(width, height / 2, 10, height, {isStatic: true})
];

World.add(world, walls);

// Maze Creation

const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0){
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
}

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

//

const startRow = Math.floor(Math.random() * cellsVertical);
const startCol = Math.floor(Math.random() * cellsHorizontal);

const traverse = (row, column) => {

    if(grid[row][column]){
        return;
    }

    grid[row][column] = true;

    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    for(let neighbour of neighbours){
        const [nextRow, nextColumn, direction] = neighbour;

        if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal){
            continue;
        }

        if(grid[nextRow][nextColumn]){
            continue;
        }

        if(direction === 'left'){
            verticals[row][column - 1] = true;
        } else if(direction === 'right'){
            verticals[row][column] = true;
        } else if(direction === 'up'){
            horizontals[row - 1][column] = true;
        } else if(direction === 'down') {
            horizontals[row][column] = true;
        }

        traverse(nextRow, nextColumn);
    }
}


traverse(startRow, startCol);

horizontals.forEach((row, rowIndex) => {
    row.forEach((isOpen, columnIndex) => {
        if(isOpen){
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'purple'
                }
            }
        );

        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((isOpen, columnIndex) => {
        if(isOpen){
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'purple'
                }
            }
        );

        World.add(world, wall)
    });
});

const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .35,
    unitLengthY * .5,
    {
        isStatic: true,
        render: {
            fillStyle: 'green'
        },
        label: 'goal'
    }
);

World.add(world, goal);

const ballRadius = Math.min(unitLengthX, unitLengthY) * .2;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
        label: 'ball'
    }
);

World.add(world, ball);

document.addEventListener('keypress', event => {
    const { x, y } = ball.velocity;

    if(event.key === 'w'){
        Body.setVelocity(ball, {x, y: y - 2.5});
    }

    if(event.key === 'a'){
        Body.setVelocity(ball, {x: x -2.5, y});
    }

    if(event.key === 's'){
        Body.setVelocity(ball, {x, y: y + 2.5});
    }

    if(event.key === 'd'){
        Body.setVelocity(ball, {x: x + 2.5, y});
    }
});

// Win Condition 

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            world.gravity.y = 1;
            world.bodies.forEach((body) => {
                if(body.label === 'wall'){
                    Body.setStatic(body, false);
                }
            })
            document.querySelector('.winner').classList.remove('hidden');
        }
    })
})  